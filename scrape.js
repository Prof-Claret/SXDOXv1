const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Lista e URL-ve për të marrë proxy
const urls = [
  // URL lama (sebagian sudah ada)
  'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt',
  'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
  'https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/http.txt',
  'https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http/http.txt',
  'https://raw.githubusercontent.com/prxchk/proxy-list/main/http.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
  'https://raw.githubusercontent.com/proxylist-to/proxy-list/main/http.txt',
  'https://raw.githubusercontent.com/yuceltoluyag/GoodProxy/main/raw.txt',
  'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
  'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt',
  'https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt',
  'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt',
  'https://raw.githubusercontent.com/opsxcq/proxy-list/master/list.txt',
  'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/https_proxies.txt',
  'https://api.openproxylist.xyz/http.txt',
  'https://api.proxyscrape.com/v2/?request=displayproxies',
  'https://api.proxyscrape.com/?request=displayproxies&proxytype=http',
  'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
  'https://www.proxydocker.com/en/proxylist/download?email=noshare&country=all&city=all&port=all&type=all&anonymity=all&state=all&need=all',
  'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=anonymous',
  'http://worm.rip/http.txt',
  'https://proxyspace.pro/http.txt',
  'https://multiproxy.org/txt_all/proxy.txt',
  'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',
  'https://www.proxy-list.download/api/v1/get?type=http',
  'https://www.proxyscan.io/download?type=http',
  'https://proxy-spider.com/api/proxies.example.txt',
  'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt',
  'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt',
  'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/http.txt',
  'https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/http.txt',
  'https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/http.txt',
  'https://raw.githubusercontent.com/zevtyardt/proxy-list/main/http.txt',
  'https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5.txt',
  'https://raw.githubusercontent.com/UserR3X/proxy-list/main/http.txt',
  'https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/http.txt',

  // Tambahan darimu:
  'https://api.ngocphong.space/get-proxy?key=Lintar21&type=http',
  'https://api.ngocphong.space/get-proxy?key=Lintar21&type=https',
  'https://api.ngocphong.space/get-proxy?key=Lintar21&type=socks4',
  'https://api.ngocphong.space/get-proxy?key=Lintar21&type=socks5',
  'https://sunny9577.github.io/proxy-scraper/proxies.txt',
  'https://sunny9577.github.io/proxy-scraper/generated/http_proxies.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/http.txt',
  'https://raw.githubusercontent.com/zloi-user/hideip.me/main/http.txt',
  'https://raw.githubusercontent.com/zloi-user/hideip.me/main/https.txt',
  'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks4&timeout=5000&country=all&ssl=all&anonymity=all',
  'https://sunny9577.github.io/proxy-scraper/generated/socks4_proxies.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/socks4.txt',
  'https://raw.githubusercontent.com/zloi-user/hideip.me/main/socks4.txt',
  'https://www.proxy-list.download/api/v1/get?type=socks4',
  'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=5000&country=all&ssl=all&anonymity=all',
  'https://sunny9577.github.io/proxy-scraper/generated/socks5_proxies.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/socks5.txt',
  'https://raw.githubusercontent.com/zloi-user/hideip.me/main/socks5.txt',
  'https://www.proxy-list.download/api/v1/get?type=socks',
  'https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/http.txt',
  'https://raw.githubusercontent.com/mallisc5/master/proxy-list-raw.txt',
  'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
  'https://raw.githubusercontent.com/saisuiu/Lionkings-Http-Proxys-Proxies/main/free.txt',
  'https://raw.githubusercontent.com/HyperBeats/proxy-list/main/https.txt',
  'https://raw.githubusercontent.com/UptimerBot/proxy-list/main/proxies/http.txt',
  'https://raw.githubusercontent.com/caliphdev/Proxy-List/master/http.txt',
  'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/https.txt',
  'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt',
  'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt',
  'https://raw.githubusercontent.com/tuanminpay/live-proxy/master/http.txt',
  'https://raw.githubusercontent.com/casals-ar/proxy-list/main/https',
  'https://raw.githubusercontent.com/casals-ar/proxy-list/main/http',
  'https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/https.txt',
  'https://raw.githubusercontent.com/proxy4parsing/proxy-list/main/http.txt',
  'http://atomintersoft.com/proxy_list_port_80',
  'http://atomintersoft.com/proxy_list_domain_org',
  'http://atomintersoft.com/proxy_list_port_3128',
  'http://www.cybersyndrome.net/pla5.html',
  'http://alexa.lr2b.com/proxylist.txt',
  'http://browse.feedreader.com/c/Proxy_Server_List-1/449196258',
  'http://free-ssh.blogspot.com/feeds/posts/default',
  'http://browse.feedreader.com/c/Proxy_Server_List-1/449196259',
  'http://johnstudio0.tripod.com/index1.htm',
  'http://atomintersoft.com/transparent_proxy_list',
  'http://atomintersoft.com/anonymous_proxy_list',
  'http://atomintersoft.com/high_anonymity_elite_proxy_list',
  'http://worm.rip/https.txt',
  'http://rootjazz.com/proxies/proxies.txt',
  'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies.txt',
  'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=1000000&country=all&ssl=all&anonymity=all',
  'https://raw.githubusercontent.com/hendrikbgr/Free-Proxy-Repo/master/proxy_list.txt'
  'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=1000000&country=all&ssl=all&anonymity=anonymous'
];

// Funksioni për të marrë të dhënat nga proxy dhe ruajti ato në një skedar
async function fetchProxies() {
    const filePath = path.resolve(__dirname, 'proxy.txt');

    try {
        // Hapus file lama jika sudah ada
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`\x1b[31m[INFO]\x1b[0m File lama ditemukan dan dihapus: \x1b[33m${filePath}\x1b[0m`);
        }

        const proxyData = [];

        // Loop untuk mengambil proxy dari semua URL
        for (const url of urls) {
            try {
                const response = await axios.get(url);

                // Validasi jika hasil berupa string dan bukan kosong
                if (response.data && typeof response.data === 'string' && response.data.trim() !== '') {
                    proxyData.push(response.data.trim());
                    console.log(`\x1b[32m[SUKSES]\x1b[0m Mengambil proxy dari: ${url}`);
                } else {
                    console.warn(`\x1b[33m[Peringatan]\x1b[0m Data kosong dari: ${url}`);
                }
            } catch (err) {
                console.error(`\x1b[31m[GAGAL]\x1b[0m Gagal mengambil proxy dari ${url}: ${err.message}`);
            }
        }

        // Gabungkan semua data proxy dan simpan ke file
        if (proxyData.length > 0) {
            fs.writeFileSync(filePath, proxyData.join('\n'), 'utf8');
            console.log(`\n\x1b[32m[BERHASIL]\x1b[0m Proxy disimpan ke file: ${filePath}`);

            // Hitung jumlah baris (jumlah proxy)
            const totalProxies = (await fs.promises.readFile(filePath, 'utf8'))
                .split('\n')
                .filter(line => line.trim() !== '').length;

            console.log(`\x1b[36m[INFO]\x1b[0m Total proxy diperoleh: \x1b[33m${totalProxies}\x1b[0m\n`);
        } else {
            console.log(`\x1b[31m[PERINGATAN]\x1b[0m Tidak ada proxy yang berhasil diambil.`);
        }

    } catch (error) {
        console.error('\x1b[31m[ERROR]\x1b[0m Terjadi kesalahan saat memproses:', error);
    }
}

fetchProxies();
