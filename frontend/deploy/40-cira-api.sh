#!/bin/sh
# Inject the API base URL (the browser talks only to this API, INV-FUN-08).
set -eu
sed -i "s|<meta name=\"cira-api\" content=\"[^\"]*\" />|<meta name=\"cira-api\" content=\"${CIRA_API}\" />|" /usr/share/nginx/html/index.html
