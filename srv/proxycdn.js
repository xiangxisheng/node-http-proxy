/* global __dirname */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const oFun = require(__dirname + '/../src/fun.js');
global.oFun = oFun;
global.oClass = require(__dirname + '/../src/class.js');
oFun.global.console();
const config = {};
config.domains = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/domains.json'), 'utf-8'));
config.servers = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/servers.json'), 'utf-8'));
config.logdir = path.join(path.dirname(__dirname), 'log');
config.listen_port = process.argv[2] ? process.argv[2] : 80;
config.listen_addr = process.argv[3] ? process.argv[3] : '0.0.0.0';
config.proxy_pass = 'http://192.168.131.21:80';//反向代理后端WEB
config.proxy_pass = 'http://dx.firadio.net:83';//反向代理后端WEB
config.max_size_mb = 0.8;//限制文件大小(MB)
config.max_size_byte = 1024 * 1024 * config.max_size_mb;
config.limit_gzsize_mb = 0.3;//限制GZ压缩后的大小(MB)
config.limit_gzsize_byte = 1024 * 1024 * config.limit_gzsize_mb;
config.gzip_options = {};
config.gzip_options.level = zlib.Z_BEST_COMPRESSION;
config.error = 1;
config.warn = 0;
config.info = 0;
config.log = 0;
config.debug = 0;
global.config = config;
console.info(config);
oFun.http.server(oFun, config);
