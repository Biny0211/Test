## to setup in your computer (development mode)
download docker desktop from https://www.docker.com/products/docker-desktop/
download the whole folder from github
optional but recommended: download github desktop and link to the repo so that you can commit & push

## to run development mode after initial setup (pls don't do initial setup each time)
open up docker desktop

run the following in your terminal (pc):
1) cd to this folder (ex: cd ShareSplit)
2) docker-compose up --build

now go to your browser; these are the links for the website and API

Frontend: http://localhost:3000

API: http://localhost:5000

note: please do not try to make your own environment and upload to github; it will break the whole thing
I'm gonna crashout if someone does breaks my environment again (If you or your AI somehow come to the conclusion that you
need CORS, please ask me because you're def doing something wrong since I've put the proxy configuration already)

## if you want to test the database:
replace this
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://neondb_owner:npg_vl1pNH6tBbwg@ep-billowing-lab-a1dgv6cr-pooler' \
                                        '.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
with your postgresql (or you can still keep the URI and test on my neontech if you want, but please do not use my ram allocation for neontech too much)