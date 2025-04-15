const express = require('express');
const multer = require('multer');
const DxfParser = require('dxf-parser');
const fs = require('fs');
const { File, Block } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});


  const upload = multer({ storage });
  
  // Helper: Extract coordinates from entities
  const extractCoordinatesFromEntities = (entities = []) => {
    const coordinates = [];
  
    console.log('\n🔎 Extracting from entities:', entities.length);
  
    entities.forEach((entity) => {
      const { type } = entity;
      console.log('➡️ Entity type:', type);
  
      switch (type) {
        case 'LINE':
          if (entity.start && entity.end) {
            coordinates.push({
              type: 'LINE',
              from: entity.start,
              to: entity.end,
            });
          }
          break;
  
        case 'CIRCLE':
          if (entity.center) {
            coordinates.push({
              type: 'CIRCLE',
              center: entity.center,
              radius: entity.radius || 0,
            });
          }
          break;
  
        case 'ARC':
          if (entity.center) {
            coordinates.push({
              type: 'ARC',
              center: entity.center,
              radius: entity.radius || 0,
              startAngle: entity.startAngle,
              endAngle: entity.endAngle,
            });
          }
          break;
  
        case 'LWPOLYLINE':
        case 'POLYLINE':
          if (entity.vertices) {
            coordinates.push({
              type,
              vertices: entity.vertices,
              ...(entity.closed !== undefined && { closed: entity.closed }),
            });
          }
          break;
  
        case 'SPLINE':
          if (entity.controlPoints) {
            coordinates.push({
              type: 'SPLINE',
              controlPoints: entity.controlPoints,
              degree: entity.degree || null,
            });
          } else {
            coordinates.push({
              type: 'SPLINE',
              raw: entity,
            });
          }
          break;
  
        default:
          // Dynamically attempt to extract common structures
          const dynamicCoords = {};
  
          if (entity.start && entity.end) {
            dynamicCoords.from = entity.start;
            dynamicCoords.to = entity.end;
          }
  
          if (entity.vertices) {
            dynamicCoords.vertices = entity.vertices;
          }
  
          if (entity.center) {
            dynamicCoords.center = entity.center;
          }
  
          if (Object.keys(dynamicCoords).length > 0) {
            coordinates.push({
              type,
              ...dynamicCoords,
            });
          } else {
            console.log(`⚠️ Unhandled entity type: ${type}`);
            coordinates.push({
              type,
              raw: entity, // Fallback: keep raw entity to avoid data loss
            });
          }
          break;
      }
    });
  
    console.log('✅ Extracted coordinates:', JSON.stringify(coordinates, null, 2));
    return coordinates;
  };
  
  
  // Upload route
  router.post('/upload', upload.single('dxfFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const { originalname, path: filePath } = req.file;
      const fileBaseName = originalname.replace(/\.[^/.]+$/, ""); // Remove file extension
  
      const parser = new DxfParser();
      const dxfData = parser.parseSync(fs.readFileSync(filePath, 'utf8'));
  
      // Save uploaded file info
      const newFile = await File.create({
        name: originalname,
        upload_date: new Date(),
      });
  
      // 1. Top-Level ENTITIES (real drawing data)
      const topLevelEntities = dxfData.entities || [];
      const topLevelCoordinates = extractCoordinatesFromEntities(topLevelEntities);
  
      if (topLevelCoordinates.length > 0) {
        await Block.create({
          name: `${fileBaseName}`,
          type: 'ENTITIES',
          coordinates: topLevelCoordinates,
          file_id: newFile.id,
        });
      }
  
      // 2. BLOCKS (skip empty or non-useful ones)
      const blocks = dxfData.blocks || {};
      for (const blockName in blocks) {
        const block = blocks[blockName];
        const coords = extractCoordinatesFromEntities(block.entities || []);
  
        // ⛔ Skip blocks that have no coordinates
        if (!coords || coords.length === 0) continue;
  
        // Optional: Filter out AutoCAD default spaces (unless you want them)
        if (['*Model_Space', '*Paper_Space', '*Paper_Space0'].includes(blockName)) continue;
  
        await Block.create({
          name: `${fileBaseName} - ${blockName}`,
          type: block.type || 'BLOCK',
          coordinates: coords,
          file_id: newFile.id,
        });
      }
  
      return res.status(200).json({ message: 'DXF processed successfully' });
    } catch (error) {
      console.error('DXF Upload Error:', error);
      res.status(500).json({ message: 'Error processing the DXF file', error: error.message });
    }
  });
  
  
router.get('/blocks', async (req, res) => {
  const { page = 1, pageSize = 10, search = '', type = '' } = req.query;
  const offset = (page - 1) * pageSize;
  const whereClause = {
    ...(search && { name: { [Op.iLike]: `%${search}%` } }),
    ...(type && { type })
  };

  try {
    const { rows: blocks, count } = await Block.findAndCountAll({
      where: whereClause,
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.status(200).json({
      blocks,
      totalPages: Math.ceil(count / pageSize),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving blocks.', error: error.message });
  }
});

router.get('/blocks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const block = await Block.findByPk(id);

    if (!block) {
      return res.status(404).json({ message: 'Block not found.' });
    }

    res.status(200).json(block);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving block.', error: error.message });
  }
});

module.exports = router;
