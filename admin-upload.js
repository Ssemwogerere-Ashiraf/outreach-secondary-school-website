// admin-upload.js
// npm install express multer body-parser basic-auth
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const basicAuth = require('basic-auth');

const app = express();
const uploadDir = path.join(__dirname,'public','assets','images','gallery');
const dataFile = path.join(__dirname,'public','data','gallery.json');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if(!fs.existsSync(path.dirname(dataFile))) fs.mkdirSync(path.dirname(dataFile), { recursive: true });

const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null, uploadDir),
  filename: (req,file,cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'-'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function checkAuth(req,res,next){
  const user = basicAuth(req);
  const ok = user && user.name === process.env.ADMIN_USER && user.pass === process.env.ADMIN_PASS;
  if(!ok){ res.set('WWW-Authenticate', 'Basic realm="Admin"'); return res.status(401).send('Unauthorized'); }
  next();
}

app.post('/admin/upload', checkAuth, upload.single('image'), express.json(), (req,res) => {
  try {
    const file = req.file;
    const { title='', caption='', category='uncategorized', tags='' } = req.body;
    if(!file) return res.status(400).json({ message:'No file uploaded' });

    // read existing data
    const json = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile)) : { items: [] };
    const relPath = '/assets/images/gallery/' + file.filename;
    const id = 'g' + Date.now();
    const entry = { id, title, caption, image: relPath, thumb: relPath, alt: title, category, tags };
    json.items.unshift(entry);
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));
    res.json({ message:'Uploaded', entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Server error' });
  }
});

app.listen(process.env.PORT || 4000, () => console.log('Uploader running'));
