
deploy:
	aws s3 sync dist/ s3://floweditor.holaemi.com
	aws cloudfront create-invalidation --distribution-id E10GG3C8SC0GVX --paths "/example.js"