const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// Veritabanı bağlantısını oluşturma
const db = mysql.createConnection({
  host: "192.168.0.138",
  user: "root",
  password: "password", // Veritabanı şifrenizi buraya yazın
  database: "ETSTSR", // Veritabanı adınızı buraya yazın
});

// Veritabanına bağlanma
db.connect((err) => {
  if (err) {
    console.error("Veritabanına bağlanırken hata oluştu:", err.stack);
    return;
  }
  console.log("Veritabanına bağlanıldı.");
});

// Kullanıcı bilgileri sözlüğü (username, password, email, role)
const users = [
  {
    username: "eoguzhan",
    password: "Password58",
    email: "eoguzhan58@gmail.com",
    role: "personel",
  },
  {
    username: "halilgünbay",
    password: "198588",
    email: "gunbaynotebook@hotmail.com",
    role: "personel",
  },
  {
    username: "trs1342",
    password: "024310trs",
    email: "hattab1342@hotmail.com",
    role: "admin",
  },
  {
    username: "Enigmateknik",
    password: "Tesa5543",
    email: "fikretkorkmaz@metaworldbilisim.com",
    role: "monitor",
  },
  {
    username: "resultakim",
    password: "Aa123456.",
    email: "resultakim@metaworldbilisim.com",
    role: "monitor",
  },
  {
    username: "iboaraskargo",
    password: "aAEnigma2007",
    email: "ibrahimaras0036@gmail.com",
    role: "admin",
  },
];

// Her bir kullanıcı için işlemi yapma
users.forEach((user) => {
  // Parolayı hash'leme
  bcrypt.hash(user.password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Parola hash'lenirken hata oluştu:", err);
      return;
    }

    // `adminusers` tablosuna veri eklemek
    const sqlAdmin =
      "INSERT INTO adminusers (username, password, email, role) VALUES (?, ?, ?, ?)";
    db.query(
      sqlAdmin,
      [user.username, hashedPassword, user.email, user.role],
      (err, result) => {
        if (err) {
          console.error("Veri eklerken hata oluştu (adminusers):", err);
          return;
        }
        console.log(`${user.username} adminusers tablosuna eklendi.`);
      }
    );

    // `users` tablosuna veri eklemek
    const sqlUsers =
      "INSERT INTO users (username, password, email, role, created_at) VALUES (?, ?, ?, ?, NOW())";
    db.query(
      sqlUsers,
      [user.username, hashedPassword, user.email, user.role],
      (err, result) => {
        if (err) {
          console.error("Veri eklerken hata oluştu (users):", err);
          return;
        }
        console.log(`${user.username} users tablosuna eklendi.`);
      }
    );
  });
});
