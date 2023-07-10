const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 8080;

const multer = require('multer')
const path = require('path')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')    
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});

app.post('/api/mahasiswa',upload.single('image'),(req, res) => {


  const data = { ...req.body };
  const nim = req.body.nim;
  const nama = req.body.nama;
  const tanggal_lahir = req.body.tanggal_lahir;
  const alamat = req.body.alamat;

  if (!req.file) {
    console.log("No file upload");
    const querySql = 'INSERT INTO mahasiswa (nim,nama,tanggal_lahir,alamat) values (?,?,?,?);';
     
    koneksi.query(querySql,[ nim,nama, tanggal_lahir,alamat], (err, rows, field) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
  });
} else {
  console.log(req.file.filename)
  var imgsrc = 'http://localhost:8080/images/' + req.file.filename;
  const foto =   imgsrc;
  const data = { ...req.body };
  const querySql = 'INSERT INTO mahasiswa (nim,nama,tanggal_lahir,alamat,foto) values (?,?,?,?,?);';

  koneksi.query(querySql,[ nim,nama, tanggal_lahir,alamat,foto], (err, rows, field) => {
    
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

        res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});
app.get('/api/mahasiswa', (req, res) => {
  const querySql = 'SELECT * FROM mahasiswa';
  koneksi.query(querySql, (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err });
  }
  res.status(200).json({ success: true, data: rows });
    });
});

app.put('/api/mahasiswa/:nim', (req, res) => {
  
  const data = { ...req.body };
  const querySearch = 'SELECT * FROM mahasiswa WHERE nim = ?';
  const nim = req.body.nim;
  const nama = req.body.nama;
  const tanggal_lahir = req.body.tanggal_lahir;
  const alamat = req.body.alamat;

  const queryUpdate = 'UPDATE mahasiswa SET nama=?,tanggal_lahir=?,alamat=? WHERE nim = ?';
  koneksi.query(querySearch, req.params.nim, (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err });
    }
    if (rows.length) {
      koneksi.query(queryUpdate, [nama,tanggal_lahir,alamat, req.params.nim], (err, rows, field) => {
        
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }
        res.status(200).json({ success: true, message: 'Berhasil update data!' });
      });
  } else {
      return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
  }
});
});
app.delete('/api/mahasiswa/:nim', (req, res) => {
  
  const querySearch = 'SELECT * FROM mahasiswa WHERE nim = ?';
  const queryDelete = 'DELETE FROM mahasiswa WHERE nim = ?';
  koneksi.query(querySearch, req.params.nim, (err, rows, field) => {
    
    if (err) {
        return res.status(500).json({ message: 'Ada kesalahan', error: err });
    }
    if (rows.length) {
      
      koneksi.query(queryDelete, req.params.nim, (err, rows, field) => {
        if (err) {
          return res.status(500).json({ message: 'Ada kesalahan', error: err });
      }
      res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
    });
} else {
    return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
}
});
});
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
