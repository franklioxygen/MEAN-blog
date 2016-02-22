module.exports = {
  'localIP': '104.131.251.23',
  'pageSize': 5,
  'logger': 0,
  'portNum': 3000,
  'dbURI': 'mongodb://localhost/blog',
  //    'dbURI': 'mongodb://meanblog:mbpass@ds060968.mongolab.com:60968/mean-blog', 
  'dbSecret': 'myBlog',
  'dbCookieKey': 'myBlog',
  'dbCookieDays': '10'
};

/*

//  config nginx:   /etc/nginx/nginx.conf

server {  
    listen  80 default_server;  
    server_name franklioxygen.com;  
    location / {  
    proxy_pass http://127.0.0.1:3000;  
    proxy_set_header        X-Real-IP       $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }  
} 
*/
