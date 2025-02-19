const express = require("express");
const session = require("express-session");
const cors = require("cors");
const mysql = require("mysql2");
const WebSocket = require("ws");
const http = require("http");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 2431;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const { spawn, exec } = require("child_process");
const path = require("path");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const { getPrinters } = require("pdf-to-printer");
const printer = require("pdf-to-printer");
const util = require("util");
const moment = require("moment");
const os = require("os");
// !
const fs = require("fs");
const router = express.Router();
const clients = new Set();
const https = require("https");

app.use(express.json());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ETSTSR",
  port: 3306,
});

const dbQuery = util.promisify(db.query).bind(db);

db.connect((err) => {
  if (err) {
    console.error("MySQL bağlantı hatası:", err);
    return;
  }
  console.log("MySQL");
});

app.use(
  session({
    secret: "superSecureRandomSecretKey123!",
    resave: false,
    saveUninitialized: true,
    rolling: false,
    cookie: {
      maxAge: 43200000,
      sameSite: "lax",
      secure: false,
    },
  })
);

app.use(
  cors({
    origin: "http://192.168.0.138:1342",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://192.168.0.138:1342");
  res.header("Access-Control-Allow-Credentials", "true"); // Kimlik bilgilerini kabul et
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // İzin verilen HTTP yöntemleri
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // İzin verilen başlıklar
  next();
});

wss.on("connection", (ws, req) => {
  sessionParser(req, {}, () => {
    const user = req.session?.user;
    if (user) {
      console.log("WebSocket kullanıcı:", user.username);
      ws.send(JSON.stringify({ message: "Yetkili erişim sağlandı.", user }));
    } else {
      ws.send(JSON.stringify({ message: "Yetkisiz erişim!" }));
      ws.close();
    }
  });

  const user = req.session?.user;

  if (user) {
    console.log("Yetkili kullanıcı bağlantı sağladı:", user.username);

    ws.send(
      JSON.stringify({
        type: "user",
        message: "Yetkili erişim sağlandı.",
        user: {
          username: user.username,
          role: user.role,
          isAdmin: user.role,
        },
      })
    );
  } else {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Yetkisiz erişim! Lütfen giriş yapın.",
      })
    );
    ws.close();
    return;
  }

  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === "fetchRecords") {
        const query = `
          SELECT *, 
          IFNULL(DATE_FORMAT(HazirlamaTarihi, '%Y-%m-%d %H:%i:%s'), '') AS HazirlamaTarihi,
          IFNULL(DATE_FORMAT(TeslimEtmeTarihi, '%Y-%m-%d %H:%i:%s'), '') AS TeslimEtmeTarihi
          FROM records
        `;

        db.query(query, (err, results) => {
          if (err) {
            console.error("Veritabanı hatası:", err.message);
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Veritabanından kayıtlar çekilemedi.",
              })
            );
            return;
          }

          ws.send(
            JSON.stringify({
              type: "records",
              data: results,
            })
          );
        });
      }
    } catch (err) {
      console.error("Mesaj ayrıştırma hatası:", err.message);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Geçersiz JSON formatı.",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket bağlantısı kapatıldı.");
  });

  ws.on("error", (error) => {
    console.error("WebSocket Hatası:", error.message);
  });
});

function authMiddleware(req, res, next) {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }

  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized access!" });
  }

  const user = req.session.user;
  req.user = {
    username: user.username,
    role: user.role,
    isAdmin: user.role === "admin",
  };
  next();
}

const formatDateForMySQL = (isoDate) => {
  if (!isoDate) return null; // Boş veya undefined değerler null döner

  const date = new Date(isoDate);

  // Geçerli tarih olup olmadığını kontrol et
  if (isNaN(date.getTime())) {
    // console.warn(`Geçersiz tarih değeri: ${isoDate}`);
    return null;
  }

  // YYYY-MM-DD HH:MM:SS formatına çevir
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

app.post("/print", async (req, res) => {
  let { data, fishNo, AdSoyad } = req.body;

  if (!data || !fishNo || !AdSoyad) {
    return res.status(400).json({ error: "Yazdırılacak veri eksik." });
  }

  try {
    // 📌 **Türkçe karakterleri Base64'ten çözme**
    data = Buffer.from(data, "base64").toString("utf-8");

    // 📌 **Masaüstü yolunu dinamik olarak al**
    const desktopPath = path.join(os.homedir(), "Desktop", "enigma-pdfs");

    // Eğer klasör yoksa oluştur
    if (!fs.existsSync(desktopPath)) {
      fs.mkdirSync(desktopPath, { recursive: true });
    }

    // 📌 **Dosya İsmini Formatla**
    const formattedDate = moment().format("YYYY-MM-DD_HH-mm-ss");
    const sanitizedAdSoyad = AdSoyad.replace(/\s+/g, "_"); // Boşlukları _ ile değiştir
    const outputPath = path.join(
      desktopPath,
      `${fishNo}_${sanitizedAdSoyad}-${formattedDate}.pdf`
    );

    // 📌 **PDF Belgesi Oluştur**
    const doc = new PDFDocument({
      size: [80 * 2.83, 200 * 2.83], // 80mm x 200mm termal etiket boyutu
      margins: { top: 5, left: 5, right: 5, bottom: 5 },
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // 📌 **Arka Planı Siyah Yap**
    // doc.rect(0, 0, doc.page.width, doc.page.height).fill("#000000");

    // 📌 **Yazı Rengini Beyaz Yap**
    // doc.fillColor("#FFFFFF");

    // 📌 **Türkçe karakterleri destekleyen yazı tipi kullan**
    doc.font("fonts/DejaVuSans.ttf"); // Türkçe karakter destekleyen font (server'a ekle)

    // 📌 **PDF Başlığı**
    doc.fontSize(14).text("KAYIT FİŞİ", { align: "center" });
    doc.moveDown(0.5);
    doc.text("-".repeat(20), { align: "center" });
    doc.moveDown(0.5);

    // 📌 **Metni Türkçe karakterlerle PDF'e yazdır**
    const lines = data.split("\n");
    lines.forEach((line) => {
      doc.fontSize(10).text(line, { align: "left" });
      doc.moveDown(0.3);
    });

    doc.end();

    writeStream.on("finish", async () => {
      console.log(`✅ PDF başarıyla oluşturuldu: ${outputPath}`);

      try {
        await printer.print(outputPath, {
          // PRINTERS
          // printer: "Argox CP-2140 PPLB",
          printer: "Xprinter XP-470B",
          options: ["-o media=Custom.80x200mm"], // 80mm x 200mm termal etiket boyutu
        });

        console.log("✅ Yazdırma tamamlandı.");
        res.json({ message: "Baskı başarılı.", pdfPath: outputPath });
      } catch (printErr) {
        console.error("❌ Yazdırma hatası:", printErr);
        res.status(500).json({ error: "Yazdırma başarısız." });
      }
    });

    writeStream.on("error", (pdfErr) => {
      console.error("❌ PDF oluşturma hatası:", pdfErr);
      res.status(500).json({ error: "PDF oluşturma başarısız." });
    });
  } catch (error) {
    console.error("❌ Base64 çözme hatası:", error);
    res.status(500).json({ error: "Veri çözümleme hatası." });
  }
});

// COKLU PRINTER TARAMA 2
// app.get("/api/printers", async (req, res) => {
//   try {
//     const printers = await getPrinters(); // Asenkron çağrı
//     if (!Array.isArray(printers)) {
//       throw new Error("Beklenmeyen yazıcı formatı");
//     }
//     res.json(printers.map((p) => p.name)); // Sadece yazıcı adlarını gönder
//   } catch (error) {
//     console.error("Yazıcıları tararken hata:", error);
//     res.status(500).json({ error: "Yazıcıları tararken hata oluştu." });
//   }
// });

// COKLU PRINTER TARAMA 1
// app.post("/api/print", async (req, res) => {
//   let { data, fishNo, AdSoyad, printerName } = req.body;

//   if (!data || !fishNo || !AdSoyad || !printerName) {
//     return res.status(400).json({ error: "Yazdırılacak veri eksik." });
//   }

//   try {
//     data = Buffer.from(data, "base64").toString("utf-8");
//     const desktopPath = path.join(os.homedir(), "Desktop", "enigma-pdfs");
//     if (!fs.existsSync(desktopPath))
//       fs.mkdirSync(desktopPath, { recursive: true });

//     const formattedDate = moment().format("YYYY-MM-DD_HH-mm-ss");
//     const sanitizedAdSoyad = AdSoyad.replace(/\s+/g, "_");
//     const outputPath = path.join(
//       desktopPath,
//       `${fishNo}_${sanitizedAdSoyad}-${formattedDate}.pdf`
//     );

//     const doc = new PDFDocument({
//       size: [80 * 2.83, 200 * 2.83],
//       margins: { top: 5, left: 5, right: 5, bottom: 5 },
//     });
//     const writeStream = fs.createWriteStream(outputPath);
//     doc.pipe(writeStream);
//     doc.fontSize(14).text("KAYIT FİŞİ", { align: "center" }).moveDown(0.5);
//     doc.text("-".repeat(56), { align: "center" }).moveDown(0.5);
//     data
//       .split("\n")
//       .forEach((line) =>
//         doc.fontSize(10).text(line, { align: "left" }).moveDown(0.3)
//       );
//     doc.end();

//     writeStream.on("finish", async () => {
//       console.log(`✅ PDF başarıyla oluşturuldu: ${outputPath}`);

//       try {
//         await printer.print(outputPath, { printer: printerName });
//         console.log(`✅ Yazdırma tamamlandı: ${printerName}`);
//         res.json({ message: "Baskı başarılı.", pdfPath: outputPath });
//       } catch (printErr) {
//         console.error("❌ Yazdırma hatası:", printErr);
//         res.status(500).json({ error: "Yazdırma başarısız." });
//       }
//     });

//     writeStream.on("error", (pdfErr) => {
//       console.error("❌ PDF oluşturma hatası:", pdfErr);
//       res.status(500).json({ error: "PDF oluşturma başarısız." });
//     });
//   } catch (error) {
//     console.error("❌ Base64 çözme hatası:", error);
//     res.status(500).json({ error: "Veri çözümleme hatası." });
//   }
// });

function atob(str) {
  return Buffer.from(str, "base64").toString("binary");
}

app.get("/api/checkAdmin", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const username = req.session?.user?.username;

  if (!username) {
    return res.status(401).json({ message: "Kullanıcı oturumu yok!" });
  }

  const query = `SELECT role FROM adminUsers WHERE username = ?`;

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("SQL hatası:", err.message);
      return res.status(500).json({ message: "Sunucu hatası" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const userRole = results[0].role;

    // 'admin', 'personel', ve 'monitor' rollerine yetki ver
    res.json({
      username,
      isAuthorized:
        userRole === "admin" ||
        userRole === "personel" ||
        userRole === "monitor",
      role: userRole,
    });
  });
});

app.post("/api/logout", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  req.session.destroy((err) => {
    if (err) {
      console.error("Oturum sonlandırma hatası:", err);
      return res.status(500).json({ message: "Çıkış işlemi başarısız oldu." });
    }
    res.clearCookie("connect.sid"); // Çerezi temizle
    res.status(200).json({ message: "Çıkış başarılı" });
  });
});

app.post("/api/login", async (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Kullanıcı adı ve şifre gereklidir." });
  }

  try {
    const userQuery = "SELECT * FROM users WHERE username = ?";
    const userResults = await dbQuery(userQuery, [username]);

    if (!userResults || userResults.length === 0) {
      return res.status(401).json({ message: "Geçersiz kullanıcı adı." });
    }

    const user = userResults[0];
    const hashedPassword = user.password;

    if (!hashedPassword) {
      console.error("Kullanıcının hashlenmiş şifresi bulunamadı.");
      return res.status(500).json({ message: "Kullanıcı şifresi eksik." });
    }

    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Geçersiz şifre." });
    }

    req.session.user = { username: user.username, role: user.role };

    if (user.role === "admin") {
      return res.status(200).json({
        message: "Başarıyla giriş yapıldı!",
        user: { username: user.username, role: user.role },
        redirectTo: "/",
        permissions: "admin",
      });
    }

    const tableStatusQuery =
      "SELECT * FROM etstsr.tablestatus WHERE username = ?";
    const tableStatusResults = await dbQuery(tableStatusQuery, [username]);

    return res.status(200).json({
      message: "Başarıyla giriş yapıldı!",
      user: { username: user.username, role: user.role },
      redirectTo: "/show-user-status",
      permissions: tableStatusResults[0] || {},
    });
  } catch (error) {
    console.error("Giriş işlemi sırasında hata:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});

app.get("/api/check-product-access/:fishNo", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { fishNo } = req.params;
  const username = req.session.user?.username;

  if (!username) {
    return res
      .status(401)
      .json({ isAuthorized: false, message: "Oturum açılmamış." });
  }

  const query = `SELECT * FROM etstsr.tablestatus WHERE username = ? AND ProductInfoPage = 1`;
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res
        .status(500)
        .json({ isAuthorized: false, message: "Yetki bilgisi alınamadı." });
    }

    if (results.length > 0) {
      res.json({ isAuthorized: true });
    } else {
      res.json({ isAuthorized: false });
    }
  });
});

app.post("/api/check-page-access", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { username, page } = req.body;

  if (!username || !page) {
    return res
      .status(400)
      .json({ message: "Kullanıcı adı ve sayfa adı gereklidir!" });
  }

  // Kullanıcının admin olup olmadığını kontrol et
  const checkUserRoleQuery = `SELECT role FROM users WHERE username = ?`;

  db.query(checkUserRoleQuery, [username], (err, roleResult) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ message: "Kullanıcı rolü alınamadı." });
    }

    if (roleResult.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const userRole = roleResult[0].role;

    // Eğer kullanıcı adminse, erişime izin ver
    if (userRole === "admin") {
      return res.json({ message: "Erişim onaylandı." });
    }

    // Admin değilse, yetkiyi kontrol et
    const query = `SELECT ?? FROM etstsr.tablestatus WHERE username = ?`;

    db.query(query, [page, username], (err, results) => {
      if (err) {
        console.error("Veritabanı hatası:", err);
        return res.status(500).json({ message: "Yetki bilgileri alınamadı." });
      }

      if (results.length === 0 || results[0][page] !== 1) {
        return res.status(403).json({ message: "Erişim reddedildi." });
      }

      res.json({ message: "Erişim onaylandı." });
    });
  });
});

app.get("/api/get-user-pages/:username", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ message: "Kullanıcı adı eksik!" });
  }

  // Önce kullanıcının rolünü al
  const checkUserRoleQuery = `SELECT role, id FROM users WHERE username = ? LIMIT 1`;

  db.query(checkUserRoleQuery, [username], (err, roleResult) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ message: "Kullanıcı rolü alınamadı." });
    }

    if (roleResult.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const userRole = roleResult[0].role;

    // Eğer kullanıcı adminse, tüm sayfalara erişim ver
    if (userRole === "admin") {
      return res.json({ role: "admin", id: userRole.id });
    }

    // Eğer kullanıcı admin değilse, yetkili olduğu sayfaları çek
    const query = `SELECT * FROM etstsr.tablestatus WHERE username = ? LIMIT 1`;

    db.query(query, [username], (err, results) => {
      if (err) {
        console.error("Veritabanı hatası:", err);
        return res.status(500).json({ message: "Yetki bilgileri alınamadı." });
      }

      if (results.length === 0) {
        return res
          .status(403)
          .json({ message: "Bu kullanıcı için yetki bulunamadı." });
      }

      // JSON.stringify kullanarak sonuçları düzgün formatta döndür
      const permissions = results[0];
      res.json(permissions);
    });
  });
});

app.get("/api/get-user-permissions/:username", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { username } = req.params;

  const query = "SELECT * FROM etstsr.tablestatus WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Yetki bilgisi getirme hatası:", err.message);
      return res
        .status(500)
        .json({ message: "Kullanıcının yetki bilgisi yok veya bulunamadı." });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Kullanıcının yetki bilgisi yok veya bulunamadı." });
    }

    res.status(200).json(results[0]);
  });
});

app.get("/api/get-session-user", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  if (req.session.user) {
    res.json({ username: req.session.user.username });
  } else {
    res.status(401).json({ message: "Oturum bulunamadı." });
  }
});

app.get("/api/get-user-records/:username", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { username } = req.params;

  // Kullanıcının görebileceği sütunları getir
  const statusQuery = "SELECT * FROM etstsr.tablestatus WHERE username = ?";
  db.query(statusQuery, [username], (err, statusResults) => {
    if (err) {
      console.error("Yetki kontrolü sırasında hata:", err.message);
      return res.status(500).json({ message: "Yetki kontrolü hatası." });
    }

    if (statusResults.length === 0) {
      return res.status(403).json({ message: "Yetkisiz erişim!" });
    }

    const userPermissions = statusResults[0];

    // **Sadece 1 olan sütunları al, ancak sayfa yetkilendirmelerini filtrele**
    const pageColumns = [
      "AddCustomerPage",
      "DeliveredProductsPage",
      "HomePage",
      "ProductInfoPage",
      "RecordFormPage",
      "ShowCostumerRecordsPage",
      "ShowUserInfoPage",
      "ChangeSettingsPage",
      "AddCustomer",
      "AddProdPage",
      "AddUserPage",
      // "ShowUserStatusPage",
      "EditUserPage",
      "ProdInfoPage",
    ];

    // **Yetkili olan ama sayfa olmayan sütunları seç**
    const allowedColumns = Object.keys(userPermissions).filter(
      (col) =>
        userPermissions[col] === 1 &&
        col !== "id" &&
        col !== "username" &&
        !pageColumns.includes(col)
    );

    if (allowedColumns.length === 0) {
      return res
        .status(403)
        .json({ message: "Bu kullanıcıya veri gösterilmiyor." });
    }

    const selectedColumns = allowedColumns.join(", "); // SQL için sütun listesi

    // Yetkili sütunları `records` tablosundan çek
    const recordsQuery = `SELECT ${selectedColumns} FROM records`;
    db.query(recordsQuery, (err, recordsResults) => {
      if (err) {
        console.error("Veri çekme hatası:", err.message);
        return res.status(500).json({ message: "Veri çekme hatası." });
      }

      res.status(200).json(recordsResults);
    });
  });
});

app.post("/api/add-user", async (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { username, password, email, role } = req.body;

  if (!username || !password || !email || !role) {
    return res
      .status(400)
      .json({ success: false, message: "Tüm alanlar zorunludur." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // İlk query için
    const query = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`;
    db.query(query, [username, hashedPassword, email, role], (err, results) => {
      if (err) {
        console.error("SQL hatası:", err.message);
        return res
          .status(500)
          .json({ success: false, message: "Sunucu hatası." });
      }

      // İkinci query'yi burada tetikliyorsanız
      const query2 = `INSERT INTO adminusers (username, password, email, role) VALUES (?, ?, ?, ?)`;
      db.query(
        query2,
        [username, hashedPassword, email, role],
        (err, results) => {
          if (err) {
            console.error("SQL hatası:", err.message);
            return res
              .status(500)
              .json({ success: false, message: "Sunucu hatası." });
          }

          // Yanıtı bir kez gönderin
          return res
            .status(200)
            .json({ success: true, message: "Kullanıcı başarıyla eklendi." });
        }
      );
    });
  } catch (error) {
    console.error("Hata:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Bir hata oluştu." });
  }
});

app.put("/api/update-user/:id", async (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const userId = req.params.id;
  const { username, email, role, password } = req.body;

  try {
    let hashedPassword = null;

    // Şifre sağlanmışsa hashle
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // İlk tabloyu güncelle
    const query1 = `
      UPDATE users 
      SET username = ?, email = ?, role = ?, password = COALESCE(?, password) 
      WHERE id = ?`;
    const params1 = [username, email, role, hashedPassword, userId];

    db.query(query1, params1, (err, results1) => {
      if (err) {
        console.error("SQL Hatası (users tablosu):", err.message);
        return res.status(500).json({ message: "Kullanıcı güncellenemedi!" });
      }

      if (results1.affectedRows === 0) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
      }

      // İkinci tabloyu güncelle
      const query2 = `
        UPDATE adminusers 
        SET username = ?, email = ?, role = ?, password = COALESCE(?, password) 
        WHERE id = ?`;
      const params2 = [username, email, role, hashedPassword, userId];

      db.query(query2, params2, (err, results2) => {
        if (err) {
          console.error("SQL Hatası (adminusers tablosu):", err.message);
          return res.status(500).json({
            message: "Kullanıcı güncellenemedi (adminusers tablosu)!",
          });
        }

        if (results2.affectedRows === 0) {
          return res
            .status(404)
            .json({ message: "Admin kullanıcı bulunamadı!" });
        }

        // Tüm işlemler başarıyla tamamlandıysa yanıt gönder
        res.json({
          message: "Kullanıcı her iki tabloda başarıyla güncellendi!",
        });
      });
    });
  } catch (err) {
    console.error("Şifre hashleme hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

app.delete("/api/delete-user/:id", async (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { id } = req.params;

  try {
    // İlk sorgu: 'users' tablosundan sil
    const deleteFromUsers = new Promise((resolve, reject) => {
      db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // İkinci sorgu: 'adminusers' tablosundan sil
    const deleteFromAdminUsers = new Promise((resolve, reject) => {
      db.query("DELETE FROM adminusers WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Her iki işlemin tamamlanmasını bekle
    await Promise.all([deleteFromUsers, deleteFromAdminUsers]);

    res
      .status(200)
      .send({ message: "Kullanıcı her iki tablodan başarıyla silindi!" });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).send({ error: "Silme işlemi başarısız oldu!" });
  }
});

app.get("/api/get-users-data", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const query = "SELECT id, username, email, role, created_at FROM users";

  db.query(query, (err, results) => {
    if (err) {
      console.error("SQL Hatası:", err.message);
      return res.status(500).json({ message: "Kullanıcılar alınamadı!" });
    }

    res.json(results);
  });
});

app.get("/api/get-user/:id", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const userId = req.params.id;
  const query =
    "SELECT id, username, email, role, created_at FROM users WHERE id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("SQL Hatası:", err.message);
      return res.status(500).json({ message: "Kullanıcı alınamadı!" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }

    res.json(results[0]);
  });
});

app.post("/api/update-settings-for-user/:id", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const userId = req.params.id;
  const { allowedColumns } = req.body;

  if (!allowedColumns || !Array.isArray(allowedColumns)) {
    return res.status(400).json({ message: "Geçersiz veri gönderildi." });
  }

  const columnsString = allowedColumns.join(",");

  const query = `
    INSERT INTO user_settings (user_id, allowed_columns)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE allowed_columns = VALUES(allowed_columns)`;

  db.query(query, [userId, columnsString], (err) => {
    if (err) {
      console.error("SQL Hatası:", err.message);
      return res.status(500).json({ message: "Ayarlar güncellenemedi!" });
    }

    res.json({ message: "Ayarlar başarıyla güncellendi!" });
  });
});

// Kullanıcı ayarlarını getir
app.get("/api/get-user-settings/:username", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const username = req.params.username; // URL'den gelen kullanıcı adı
  console.log(username);
  // Kullanıcı ID'sini almak için users tablosundan sorgu
  const query = `
    SELECT * FROM users WHERE username = ? LIMIT 1
  `;

  db.query(query, [username], (err, result) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ message: "Bir hata oluştu." });
    }

    if (result.length > 0) {
      const userId = result[0].id; // Kullanıcı ID'sini aldık

      // Şimdi user_id ile user_settings tablosundan kolonları çekiyoruz
      const settingsQuery = `
        SELECT selected_columns FROM user_settings
        WHERE user_id = ? LIMIT 1
      `;

      db.query(settingsQuery, [userId], (err, result) => {
        if (err) {
          console.error("Veritabanı hatası:", err);
          return res.status(500).json({ message: "Bir hata oluştu." });
        }

        if (result.length > 0) {
          const selectedColumns = result[0].selected_columns.split(", ");
          res.status(200).json({ selectedColumns });
        } else {
          res.status(404).json({ message: "Kullanıcı ayarları bulunamadı." });
        }
      });
    } else {
      res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
  });
});

app.post("/api/change-user-settings", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { username, permissions } = req.body;

  if (!username || !permissions || Object.keys(permissions).length === 0) {
    return res
      .status(400)
      .json({ message: "Kullanıcı adı ve yetkiler boş olamaz!" });
  }

  const columnsNames = Object.keys(permissions);
  const columnsValues = Object.values(permissions);

  // Kullanıcı var mı kontrol et
  const checkQuery = `SELECT COUNT(*) AS count FROM etstsr.tablestatus WHERE username = ?`;

  db.query(checkQuery, [username], (err, result) => {
    if (err) {
      console.error("SQL Hatası:", err.message || err);
      return res.status(500).json({ message: "Veritabanı hatası oluştu." });
    }

    const userExists = result[0].count > 0;

    if (userExists) {
      // Kullanıcı varsa UPDATE yap
      const updateQuery = `
        UPDATE etstsr.tablestatus 
        SET ${columnsNames.map((col) => `${col} = ?`).join(", ")}
        WHERE username = ?
      `;

      db.query(
        updateQuery,
        [...columnsValues, username],
        (err, updateResult) => {
          if (err) {
            console.error("SQL Güncelleme Hatası:", err.message || err);
            return res
              .status(500)
              .json({ message: "Yetki güncellenirken hata oluştu." });
          }
          res.status(200).json({ message: "Yetkiler başarıyla güncellendi." });
        }
      );
    } else {
      // Kullanıcı yoksa INSERT yap
      const insertQuery = `
        INSERT INTO etstsr.tablestatus (username, ${columnsNames.join(", ")})
        VALUES (?, ${columnsNames.map(() => "?").join(", ")})
      `;

      db.query(
        insertQuery,
        [username, ...columnsValues],
        (err, insertResult) => {
          if (err) {
            console.error("SQL Ekleme Hatası:", err.message || err);
            return res
              .status(500)
              .json({ message: "Yetki eklenirken hata oluştu." });
          }
          res.status(200).json({ message: "Yetkiler başarıyla eklendi." });
        }
      );
    }
  });
});

app.get("/api/delivered-products", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const query = "SELECT * FROM records WHERE Durum = 'Teslim Edildi'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err.message);
      return res.status(500).json({ message: "Veritabanı hatası" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Kayıt bulunamadı" });
    }

    // Tüm kayıtları döndürüyoruz
    res.json({ data: results });
  });
});

app.get("/api/getInfoProd/:fishNo", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const fishNo = req.params.fishNo;

  const query = "SELECT * FROM records WHERE fishNo = ? LIMIT 1";
  db.query(query, [fishNo], (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err.message);
      return res.status(500).json({ message: "Veritabanı hatası" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Kayıt bulunamadı" });
    }

    res.json({ data: results[0] });
  });
});

app.get("/api/protected", authMiddleware, (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }

  const username = req.session.user?.username;

  if (!username) {
    return res.status(401).json({ message: "Yetkilendirilmemiş erişim!" });
  }

  // Veritabanı kontrolü seçeneği
  const includeDB = req.query.includeDB === "true"; // ?includeDB=true parametresi kontrol ediliyor

  if (includeDB) {
    const query = "SELECT username, role FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
      if (err) {
        console.error("Veritabanı hatası:", err.message);
        return res.status(500).json({ message: "Sunucu hatası" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      const user = results[0];
      // Veritabanı bilgilerini döndür
      res.json({
        user: {
          username: user.username,
          role: user.role,
          isAdmin: user.role === "admin",
        },
        message: "Veritabanı kontrolü başarıyla tamamlandı.",
      });
    });
  } else {
    // Sadece oturum bilgilerini döndür
    res.json({
      message: "Yetkili erişim sağlandı.",
      user: req.session.user,
    });
  }
});

app.get("/api/records", authMiddleware, (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { username, role } = req.user; // authMiddleware'den gelen kullanıcı bilgileri

  // Eğer kullanıcı 'monitor' rolündeyse sadece kayıtları görsün, düzenleme yapamasın
  if (role === "monitor") {
    const query = "SELECT * FROM records"; // Kayıtları görme yetkisi
    db.query(query, (err, results) => {
      if (err) {
        console.error("Database error (Monitor access):", err.message);
        return res.status(500).json({ message: "Server error." });
      }
      return res.json({ data: results });
    });
  } else if (role === "admin" || role === "personel") {
    const query = "SELECT * FROM records"; // Admin ve Personel düzenleme yetkisi de olabilir
    db.query(query, (err, results) => {
      if (err) {
        console.error(
          "Database error (Admin or Personel access):",
          err.message
        );
        return res.status(500).json({ message: "Server error." });
      }
      return res.json({ data: results });
    });
  } else {
    return res.status(403).json({ message: "Unauthorized access!" }); // Diğer rollere kısıtlama
  }
});

app.get("/api/record/:fishNo", (req, res) => {
  const { fishNo } = req.params;
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // İstemci IP'sini al

  if (!fishNo) {
    return res.status(400).json({ message: "Fiş numarası gerekli." });
  }

  const query = "SELECT * FROM records WHERE fishNo = ?";
  db.query(query, [fishNo], (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err.message);
      return res.status(500).json({ message: "Sunucu hatası." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Kayıt bulunamadı." });
    }

    // ** eğer istek yetkili istemciden gelmiyorsa mesaj döndür **
    if (clientIP !== "http://192.168.0.138:1342") {
      return res
        .status(403)
        .json({ message: "Bu verilere erişim izniniz yok." });
    }

    // yetkili istemciye tam veriyi gönder
    res.json(results[0]);
  });
});

app.get("/api/get-all-fishNos", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.status(403).json({ message: "Bu verilere erişim izniniz yok." });
  }

  const query = "SELECT fishNo FROM records"; // tüm geçerli `fishNo` değerlerini al

  db.query(query, (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ message: "FishNo verileri alınamadı." });
    }

    const fishNos = results.map((row) => row.fishNo); // fishNo değerlerini bir diziye çevir
    res.json(fishNos);
  });
});

app.put("/api/record/:fishNo", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // İstemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.status(403).json({ message: "Bu verilere erişim izniniz yok." });
  }
  const { fishNo } = req.params;
  const {
    AdSoyad,
    TelNo,
    SeriNo,
    TeslimAlan,
    Durum,
    Teknisyen,
    Urun,
    Marka,
    Model,
    GarantiDurumu,
    Ucret,
    Sorunlar,
    Aciklama,
    Yapilanlar,
    HazirlamaTarihi,
    TeslimEtmeTarihi,
  } = req.body;

  console.log("Gelen Veriler:", req.body); // Verilerin eksiksiz geldiğini kontrol et

  const sanitizeInput = (value) => (value === undefined ? null : value);

  const queryParams = [
    sanitizeInput(AdSoyad) || "",
    sanitizeInput(TelNo) || "",
    sanitizeInput(SeriNo) || "",
    sanitizeInput(TeslimAlan) || "",
    sanitizeInput(Durum) || "",
    sanitizeInput(Teknisyen) || "",
    sanitizeInput(Urun) || "",
    sanitizeInput(Marka) || "",
    sanitizeInput(Model) || "",
    sanitizeInput(GarantiDurumu) || "",
    parseFloat(Ucret),
    // Ucret,
    sanitizeInput(Sorunlar) || "",
    sanitizeInput(Aciklama) || "",
    sanitizeInput(Yapilanlar) || "",
    HazirlamaTarihi ? formatDateForMySQL(HazirlamaTarihi) : null,
    TeslimEtmeTarihi ? formatDateForMySQL(TeslimEtmeTarihi) : null,
    fishNo,
  ];

  const query = `
    UPDATE records 
    SET AdSoyad = ?, TelNo = ?, SeriNo = ?, TeslimAlan = ?, Durum = ?, 
        Teknisyen = ?, Urun = ?, Marka = ?, Model = ?, GarantiDurumu = ?, Ucret = ?, Sorunlar = ?, Aciklama = ?, Yapilanlar = ?,
        HazirlamaTarihi = ?, TeslimEtmeTarihi = ?
    WHERE fishNo = ?
  `;

  console.log("Güncellenen Değerler:", queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Veritabanı güncelleme hatası:", err.message);
      return res
        .status(500)
        .json({ error: "Güncelleme sırasında hata oluştu." });
    }

    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Kayıt başarıyla güncellendi!" });
    } else {
      res.status(404).json({ message: "Belirtilen kayıt bulunamadı." });
    }
  });
});

app.get("/api/export-records", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const query = `
    SELECT fishNo, AdSoyad, DATE_FORMAT(TeslimAlmaTarihi, '%Y-%m-%d %H:%i:%s') AS TeslimAlmaTarihi, 
           TelNo, Urun, Marka, Model, SeriNo, GarantiDurumu, TeslimAlan, Teknisyen, 
           Ucret, Sorunlar, DATE_FORMAT(HazirlamaTarihi, '%Y-%m-%d %H:%i:%s') AS HazirlamaTarihi, 
           DATE_FORMAT(TeslimEtmeTarihi, '%Y-%m-%d %H:%i:%s') AS TeslimEtmeTarihi, Durum 
    FROM records
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err.message);
      return res
        .status(500)
        .json({ error: "Veritabanından veriler alınırken hata oluştu." });
    }

    res.status(200).json(results);
  });
});

app.post("/api/record", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
  const { AdSoyad } = req.body;

  if (!AdSoyad) {
    return res.status(400).json({ message: "Adı Soyadı alanı gereklidir." });
  }

  const query = "INSERT INTO records (AdSoyad) VALUES (?)";
  db.query(query, [AdSoyad], (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ message: "Sunucu hatası." });
    }

    res.status(201).json({
      message: "Kayıt başarıyla eklendi!",
      recordId: results.insertId,
    });
  });
});

const generateFishNoID = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return (
    "FSH-" +
    chars[Math.floor(Math.random() * chars.length)] +
    chars[Math.floor(Math.random() * chars.length)] +
    chars[Math.floor(Math.random() * chars.length)] +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
};

app.post("/api/addpro", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }

  const {
    AdSoyad,
    TelNo,
    TeslimAlan,
    Teknisyen,
    SeriNo,
    Urun,
    Marka,
    Model,
    GarantiDurumu,
    BirlikteAlinanlar,
    Sorunlar,
    Aciklama,
  } = req.body;

  if (
    !AdSoyad ||
    !TelNo ||
    !TeslimAlan ||
    !Teknisyen ||
    !SeriNo ||
    !Urun ||
    !Marka ||
    !Model ||
    !GarantiDurumu ||
    !Sorunlar
  ) {
    console.error("Eksik Alanlar:", req.body);
    return res
      .status(400)
      .json({ message: "Tüm alanların doldurulması zorunludur!" });
  }

  const newId = generateFishNoID(); // Yeni FishNoID oluştur
  const costumerId = generateFishNoID(); // Benzersiz müşteri ID'si oluştur

  const recordQuery = `
    INSERT INTO records 
    (AdSoyad, TeslimAlmaTarihi, TelNo, TeslimAlan, Teknisyen, SeriNo, Urun, Marka, Model, GarantiDurumu, BirlikteAlinanlar, Sorunlar, Aciklama, Ucret, HazirlamaTarihi, TeslimEtmeTarihi, Durum)
    VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 'Bekliyor');
  `;

  const costumerQuery = `
    INSERT INTO costumerData (id, AdSoyad, FishNoID) 
    VALUES (?, ?, ?);
  `;

  db.query(
    recordQuery,
    [
      AdSoyad,
      TelNo,
      TeslimAlan,
      Teknisyen,
      SeriNo,
      Urun,
      Marka,
      Model,
      GarantiDurumu,
      BirlikteAlinanlar,
      Sorunlar,
      Aciklama,
    ],
    (err, result) => {
      if (err) {
        console.error("SQL Hatası (records):", err.message);
        return res
          .status(500)
          .json({ message: "Bir hata oluştu.", error: err.message });
      }

      // Eğer `records` ekleme başarılı olursa `costumerData`'ya da ekleme yapalım
      db.query(costumerQuery, [costumerId, AdSoyad, newId], (err, result) => {
        if (err) {
          console.error("SQL Hatası (costumerData):", err.message);
          return res
            .status(500)
            .json({ message: "Bir hata oluştu.", error: err.message });
        }

        res.status(201).json({
          message: "Ürün başarıyla eklendi!",
          recordId: result.insertId,
          costumerId: costumerId,
          fishNoID: newId,
        });
      });
    }
  );
});

app.post("/api/addpro", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip;

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }

  const {
    AdSoyad,
    TelNo,
    TeslimAlan,
    Teknisyen,
    SeriNo,
    Urun,
    Marka,
    Model,
    GarantiDurumu,
    BirlikteAlinanlar,
    Sorunlar,
    Aciklama,
  } = req.body;

  if (
    !AdSoyad ||
    !TelNo ||
    !TeslimAlan ||
    !Teknisyen ||
    !SeriNo ||
    !Urun ||
    !Marka ||
    !Model ||
    !GarantiDurumu ||
    !Sorunlar
  ) {
    console.error("Eksik Alanlar:", req.body);
    return res
      .status(400)
      .json({ message: "Tüm alanların doldurulması zorunludur!" });
  }

  const insertRecordQuery = `
    INSERT INTO etstsr.record 
    (AdSoyad, TeslimAlmaTarihi, TelNo, TeslimAlan, Teknisyen, SeriNo, Urun, Marka, Model, GarantiDurumu, BirlikteAlinanlar, Sorunlar, Aciklama, Ucret, HazirlamaTarihi, TeslimEtmeTarihi, Durum)
    VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 'Bekliyor');
  `;

  db.query(
    insertRecordQuery,
    [
      AdSoyad,
      TelNo,
      TeslimAlan,
      Teknisyen,
      SeriNo,
      Urun,
      Marka,
      Model,
      GarantiDurumu,
      BirlikteAlinanlar,
      Sorunlar,
      Aciklama,
    ],
    (err, result) => {
      if (err) {
        console.error("SQL Hatası (records):", err.message);
        return res
          .status(500)
          .json({ message: "Bir hata oluştu.", error: err.message });
      }

      // `fishNo` değerini almak için sorgu çalıştır
      db.query(
        "SELECT fishNo FROM etstsr.record ORDER BY id DESC LIMIT 1;",
        (err, rows) => {
          if (err) {
            console.error("SQL Hatası (fishNo alma):", err.message);
            return res
              .status(500)
              .json({ message: "FishNo alınamadı.", error: err.message });
          }

          const FishNoID = rows[0].fishNo; // Son eklenen fishNo değeri

          if (!FishNoID) {
            return res
              .status(500)
              .json({ message: "FishNo değeri bulunamadı!" });
          }

          // `costumerData` tablosuna ekleme
          const costumerQuery = `
          INSERT INTO costumerData (id, AdSoyad, FishNoID) 
          VALUES (UUID(), ?, ?);
        `;

          db.query(costumerQuery, [AdSoyad, FishNoID], (err, result) => {
            if (err) {
              console.error("SQL Hatası (costumerData):", err.message);
              return res
                .status(500)
                .json({ message: "Bir hata oluştu.", error: err.message });
            }

            res.status(201).json({
              message: "Ürün başarıyla eklendi!",
              recordId: result.insertId,
              fishNoID: FishNoID,
            });
          });
        }
      );
    }
  );
});

app.post("/api/addpro", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip;

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }

  const {
    AdSoyad,
    TelNo,
    TeslimAlan,
    Teknisyen,
    SeriNo,
    Urun,
    Marka,
    Model,
    GarantiDurumu,
    BirlikteAlinanlar,
    Sorunlar,
    Aciklama,
  } = req.body;

  if (
    !AdSoyad ||
    !TelNo ||
    !TeslimAlan ||
    !Teknisyen ||
    !SeriNo ||
    !Urun ||
    !Marka ||
    !Model ||
    !GarantiDurumu ||
    !Sorunlar
  ) {
    console.error("Eksik Alanlar:", req.body);
    return res
      .status(400)
      .json({ message: "Tüm alanların doldurulması zorunludur!" });
  }

  const insertRecordQuery = `
    INSERT INTO etstsr.record 
    (AdSoyad, TeslimAlmaTarihi, TelNo, TeslimAlan, Teknisyen, SeriNo, Urun, Marka, Model, GarantiDurumu, BirlikteAlinanlar, Sorunlar, Aciklama, Ucret, HazirlamaTarihi, TeslimEtmeTarihi, Durum)
    VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 'Bekliyor');
  `;

  db.query(
    insertRecordQuery,
    [
      AdSoyad,
      TelNo,
      TeslimAlan,
      Teknisyen,
      SeriNo,
      Urun,
      Marka,
      Model,
      GarantiDurumu,
      BirlikteAlinanlar,
      Sorunlar,
      Aciklama,
    ],
    (err, result) => {
      if (err) {
        console.error("SQL Hatası (record ekleme):", err.message);
        return res
          .status(500)
          .json({ message: "Bir hata oluştu.", error: err.message });
      }

      // **Eklendikten sonra ilgili fishNo değerini al**
      db.query(
        "SELECT fishNo FROM etstsr.records WHERE AdSoyad = ? ORDER BY fishNo DESC LIMIT 1;",
        [AdSoyad],
        (err, rows) => {
          if (err) {
            console.error("SQL Hatası (fishNo alma):", err.message);
            return res
              .status(500)
              .json({ message: "FishNo alınamadı.", error: err.message });
          }

          if (!rows || rows.length === 0) {
            return res
              .status(500)
              .json({ message: "FishNo değeri bulunamadı!" });
          }

          const FishNoID = rows[0].fishNo; // FishNo değerini al

          // **costumerData'ya ekle**
          const costumerQuery = `
            INSERT INTO etstsr.costumerData (id, AdSoyad, FishNoID) 
            VALUES (UUID(), ?, ?);
          `;

          db.query(costumerQuery, [AdSoyad, FishNoID], (err, result) => {
            if (err) {
              console.error("SQL Hatası (costumerData ekleme):", err.message);
              return res
                .status(500)
                .json({ message: "Bir hata oluştu.", error: err.message });
            }

            res.status(201).json({
              message: "Ürün başarıyla eklendi!",
              recordId: result.insertId,
              fishNoID: FishNoID,
            });
          });
        }
      );
    }
  );
});

app.delete("/api/deleteProduct/:fishNo", async (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }

  const { fishNo } = req.params;

  try {
    // Ürünü veritabanından silmek için SQL sorgusunu çalıştırıyoruz
    const query = "DELETE FROM records WHERE fishNo = ?";

    // Veritabanı sorgusunu çalıştır
    db.query(query, [fishNo], (err, result) => {
      if (err) {
        console.error("Veritabanı hatası:", err.message);
        return res.status(500).json({ message: "Sunucu hatası" });
      }

      // Silme işlemi başarılıysa
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }

      // Ürün başarıyla silindi
      res.status(200).json({ message: "Ürün başarıyla silindi" });
    });
  } catch (error) {
    console.error("Silme hatası:", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.get("/", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/");
  }
});

app.get("*", (req, res) => {
  const clientIP = req.headers.origin || req.headers.referer || req.ip; // istemci IP'sini al

  if (clientIP !== "http://192.168.0.138:1342") {
    return res.redirect("http://192.168.0.138:1342/*");
  }
});

// server.listen(PORT, () => {
//   console.log(`http://192.168.0.138:${PORT}`);
// });

server.listen(PORT, "192.168.0.138", () => {
  console.log(`http://192.168.0.138:${PORT}`);
});
