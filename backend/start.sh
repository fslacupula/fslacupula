#!/usr/bin/env bash
# Script de inicio para Render.com

echo "🚀 Iniciando despliegue de FutbolClub Backend..."

# Ejecutar migraciones/inicialización de base de datos
echo "📊 Configurando base de datos..."
node -e "
const { pool } = require('./models/index.js');
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    console.log('Conectando a la base de datos...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      console.log('Ejecutando schema.sql...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('✅ Base de datos inicializada correctamente');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error al inicializar BD:', error);
    process.exit(1);
  }
}

initDB();
"

echo "✅ Base de datos lista"
echo "🎯 Iniciando servidor..."

# Iniciar el servidor
npm start
