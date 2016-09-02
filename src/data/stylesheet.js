module.exports = `@charset "UTF-8";
/* CSS Document */
body {
  margin:0;
  font-family: 'Roboto', serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: normal;
  color: #444;
  background: #887 url('../images/responsive/back2.png');
}
.clearfix:before,
.clearfix:after {
	content:"";
	display:table;
}
.clearfix:after {
	clear:both;
}
.swiper-container {
	margin:0 auto;
	position:relative;
	overflow:hidden;
	-webkit-backface-visibility:hidden;
	-moz-backface-visibility:hidden;
	-ms-backface-visibility:hidden;
	-o-backface-visibility:hidden;
	backface-visibility:hidden;
	/* Fix of Webkit flickering */
	z-index:1;
}
.swiper-wrapper {
	position:relative;
	width:100%;
	-webkit-transition-property:-webkit-transform, left, top;
	-webkit-transition-duration:0s;
	-webkit-transform:translate3d(0px,0,0);
	-webkit-transition-timing-function:ease;

	-moz-transition-property:-moz-transform, left, top;
	-moz-transition-duration:0s;
	-moz-transform:translate3d(0px,0,0);
	-moz-transition-timing-function:ease;

	-o-transition-property:-o-transform, left, top;
	-o-transition-duration:0s;
	-o-transform:translate3d(0px,0,0);
	-o-transition-timing-function:ease;
	-o-transform:translate(0px,0px);

	-ms-transition-property:-ms-transform, left, top;
	-ms-transition-duration:0s;
	-ms-transform:translate3d(0px,0,0);
	-ms-transition-timing-function:ease;

	transition-property:transform, left, top;
	transition-duration:0s;
	transform:translate3d(0px,0,0);
	transition-timing-function:ease;

	-webkit-box-sizing: content-box;
	-moz-box-sizing: content-box;
	box-sizing: content-box;
}
.swiper-free-mode > .swiper-wrapper {
	-webkit-transition-timing-function: ease-out;
	-moz-transition-timing-function: ease-out;
	-ms-transition-timing-function: ease-out;
	-o-transition-timing-function: ease-out;
	transition-timing-function: ease-out;
	margin: 0 auto;
}
.swiper-slide {
	float: left;
}
.error-404 {
	text-align:center;
    padding: 15% 5%;
}
.error-404-title {
    font-size: 7em;
    margin-bottom: 0.3em;
}

.error-404-p {
    font-size: 2em;
    font-weight: 100;
    margin-top: 0;
}
/* IE10 Windows Phone 8 Fixes */
.swiper-wp8-horizontal {
	-ms-touch-action: pan-y;
}
.swiper-wp8-vertical {
	-ms-touch-action: pan-x;
}

.swiper-container {
	position:relative;
	width:100%;
	height: 700px;
	/* Specify Swiper's Size: */

	/*width:200px;
	height: 100px;*/
	padding: 10px 0;
	padding-bottom: 3em;
}
.swiper-pagination-switch {
  display: inline-block;
  width: 1em;
  height: 0.5em;
  border-radius: 0;
  background: #7C7C7C;
  margin-right: 0.6em;
  opacity: 1;
  cursor: pointer;
  margin-bottom: 0.4em;
  border-top: 0.2em solid #fff;
}
.swiper-visible-switch {
}
@media screen and (max-width:767px) {
	.swiper-pagination-switch {
		width: 0.8em;
		height: 0.8em;
		border-width: 2px;
		box-shadow: 0 0 5px rgba(0,0,0,0.6);
		margin-right: 0.4em;
	}
}
.swiper-pagination-switch:hover {
    background: #FFFFFF !important;
}
.wrapper {
  /* max-width:1200px; */
  background:#fff;
  margin:0 auto;
  position:relative;
  overflow: hidden;
}
#bannerHead {
  background:#000 url('/images/responsive/textured-header.jpg');
}
.shutter-header {
    background: fixed #000;
    background-position:center 0;
    height: 400px;
    overflow: hidden;
    background-repeat: no-repeat;
}
.shutter-title {
    color: #FFFFFF;
    position: relative;
    text-align: center;
    top: 25%;
    max-width: 1200px;
    margin: 0 auto;
}
.shutter-title-image {
    width: 60%;
    position: relative;
    /* max-width: 636px; */
}
.shutter-sprite {
  width:1816px;
  height:800px;
  right:100%;
  top:0;
  position:absolute;
}
.shutter-blocker {
  width:1200px;
  height:800px;
  background:#000;
  position:absolute;
  top:0;
  left:0;
}
.shutter-texture {
  background:url('../images/responsive/shutter.png');
  width:584px;
  height:800px;
  position:absolute;
  top:0;
  left:1200px;
}
a {
  text-decoration: underline;
  color: #009DFF;
}
a:hover {
    text-decoration: none;
    color: #005BFF;
}
h1, h2, h3, h4 {
  font-family: 'Arvo';
  font-weight: bold;
  margin:0;
  padding:0;
  line-height:normal;
}
h1 a, h2 a, h3 a, h4 a {
  color: #333;
}
h1 a:hover, h2 a:hover, h3 a:hover, h4 a:hover {
  color: #000;
  text-shadow: 0 0 5px #fff;
}
#navbar {
    max-width: 100%;
    overflow: hidden;
    position: relative;
    z-index: 100;
}
.leftImage {
    float: left;
    margin: 21px 10px 21px 0;
    width: 50%;
}
h1 {
	font-size: 3em;
	margin: 0.5em 0;
	letter-spacing: -.5px;
	line-height: 1.1;
	color: #555;
	text-shadow: 4px 4px 0 #eee;
	font-weight: bold;
	text-transform: uppercase;
}
.content > div > h1:first-child,
.content > div > h2:first-child,
.content > div > h4:first-child,
.content > div > h3:first-child {
	margin-top:0;
	padding-top:0;
}
h2 {
	margin: .5em 0;
	font-weight: bold;
	color: #888;
	text-shadow: 3px 3px 0px #eee;
	font-size: 1.75em;
}
.entry-full h2, .entry-full h3, .entry-full h4 {
    margin-top: 1.5em;
}
#menu {
    background: #555555;
}

.menu-sublinks-container  a {
    text-decoration: none;
}
#menuList > li {
    font-size: 1.2em;
    line-height: 1;
}
#menuList h1, #menuList h2, #menuList h3, #menuList h4 {
  padding-bottom: 14px;
    padding-top: 31px;
}
@media screen and (min-width:526px) {
	#menuList > li {
		font-size: 1.3em;
		letter-spacing: .05em;
	}
}
#menu > div {
}
.content {
  background: #e8e8e8;
}
.content img {
  max-width:100%;
  height: auto;
}
.entry {
  /* max-width:600px; */
  margin:0 auto;
  padding: 6% 6%;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
}
.entry-aside {
	padding: 5% 8%;
}
.entry-default-aside {
	background-color: #ddd;
}
.button {
    display: inline-block;
    padding: 0.3em 0.8em;
    background: #AAA9A9;
    color: #E9E9E9;
    font-family: 'Arvo';
    font-weight: bold;
    font-size: 1.6em;
    border-radius: 0.2em;
    margin: 0.3em;
    box-shadow: 0.1em 0.2em 0 rgba(0, 0, 0, 0.04);
    text-decoration: none;
    text-transform: uppercase;
}
.button:hover {
    background: #8F8F8F;
    color: #fff;
}
.button:before {
    font-family: 'icomoon'; speak: none;
    display: inline-block;
    padding-right: 0.5em;
    font-size: 1.2em;
    line-height: 1em;
    position: relative;
    top: 0.1em;
    -webkit-font-smoothing: antialiased;
}
.fork:before {
    content: "\e182";
}
.launch:before {
    content: "\e0fd";
}
@media screen and (min-width:768px) {
	.entry {
		width: 63%;
		float:left;
	}
	.entry-aside {
		width: 29%;
		float:right;
		padding: 2.5%;
	}
	.entry-aside-home {
		padding:14% 5% 0 0;
		width:36%;
	}
	.entry-paged:before {
		position: absolute;
		width: 33.1%;
		content: "";
		background: #999999;
		height: 540px;
		z-index: 0;
		top: 0;
		left: 0;
		max-width: 450px;
	}
}
@media screen and (min-width:1100px) {
	.entry-aside {
		padding: 1em 6% 0 6%;
	}
	.entry-aside-home {
		padding: 9% 5% 0 0;
		width:36%
	}
}
.entry-aside-home {
    text-align: center;
    box-sizing: border-box;
	-moz-box-sizing: border-box;
}
.content p {
  /* text-align:justify; */
}
.menu-links a {
    color: #eee;
    display: block;
    text-decoration: none;
    padding: 0.5em 0;
    display: inline-block;
}
#menu a > img {
  margin-right:5px;
}
#menu a:hover, #menu a:active {
  color: #fff;
  text-shadow: 3px 3px 0 rgba(0,0,0,.4);
}
#menu ul {
  margin:0;
  padding:0;
}
#menu li {
  list-style:none;
  margin: 0;
  padding: 0.6em 0;
  float: left;
  width: 33%;
  text-align: center;
  font-family: 'Arvo';
  font-weight: bold;
  text-transform: uppercase;
}
#menu li > div {
    /* border-left: 4px solid #e5e5e5; */
  border-left: 5px dotted #dedeff;
    font-size: 90%;
  margin: 8px 0 18px 6px;
  padding: 0 0 0 16px;
}
#menu li > div > div {
  font-size:100%;
  text-transform:none;
}
#middle {
  position:relative;
  background:#eee;
}
.videoThumb {
  position:relative;
}
.videoThumb h1, .videoThumb h2, .videoThumb h3, .videoThumb p  {
  background: rgba(0, 0, 0, 0.5);
  color: #FFFFFF;
  position: absolute;
  text-align: center;
  text-shadow: 0 0 5px #000000;
  top: 35%;
  width: 100%;
}
.videoThumb a:hover h1, .videoThumb a:hover h2, .videoThumb a:hover h3, .videoThumb a:hover p  {
  background: rgba(255, 255, 255, 0.5);
  color: #000;
  text-shadow: 0 0 5px #fff;
}
.gallery .img {
    height: 25%;
    width: 25%;
  float:left;
}
.gallery .img a img {
    border: 1px solid #000;
    height: auto;
    margin: 5% 0;
    width: 90%;
}
#footer {
  position:relative;
  background:#000;
  padding:30px 10%;
}
#footer p {
  position:relative;
  right:0;
  padding:0;
  margin:0;
  color:#fff;
  text-align:right;
}
#footer p a {
  color:#fff;
}
#footer p a:hover, #footer p a:active  {
  text-shadow:0 0 2px #fff;
}
#footer div {
  float:left;
  color:#666;
  position: relative;
  z-index: 1;
}
#footer div a {
	color: #fff;
}
.sub {
  text-align:right;
  margin-top:25px;
  color:#aaa;
  font-style:italic;
  font-size:10px;
}
.blogDescription {
  width:500px;
  background: rgba(0,0,0,0.9);
  color:#fff;
  top:0;
  left:0;
  display:none;
  position:absolute;
  padding:20px;
  border-radius:10px;
  border:2px solid #fff;
}
.blogDescription h1, .blogDescription h2, .blogDescription h3 {
  text-align:center;
  margin-bottom: 10px;
}
.blogDescription > div {
  overflow:hidden;
  max-height:600px;
}
.blogDescription img, .blogDescription iframe, .blogDescription object {
  max-width:500px;
  max-height:500px;
  height:auto;
  width:auto;
}
@media screen and (max-width: 800px) {
  .gallery .img {
    height: 33%;
    width: 33%;
  }

  .shutter-title {
    font-size:45px;
    padding:32px 50px;
  }

  .videoThumb h1 {
    font-size:24px;
  }

  .videoThumb h2 {
    font-size:18px;
  }


}
@media screen and (max-width: 525px) {
  h1 {font-size:30px;}

  #menu {
    float:none;
    margin-top:0;

    padding: 1em 0;
}

  .shutter-title-img {
    width:90%;
  }

  #largeScreen {
    display:none;
  }

  .content {
    width:100%;
    max-width:none;
  }

  #menu {
    top:0;
    left:0;
    position:relative;
    width:100%;
    max-width:none;
  }

  #footer div {
    width:100%;
    position:relative;
    float:none;
    text-align:center;
  }

  #footer p {
    text-align:center;
  }
}
@media screen and (max-width:350px) {
  .gallery .img {
    height: 50%;
    width: 50%;
  }
  .shutter-title {
    font-size:35px;
  }
}
.separator {
  clear:left !important;
}
#ArchiveList a {
  display:inline;
}
@media screen and (max-width: 800px) {
	.shutter-header {
		height:400px;
		background-image:url('../images/headers/sine-wave-md.jpg');
	}
}
@media screen and (min-width: 801px) {
	.shutter-header {
		height: 647px;
		background-image: url('../images/headers/sine-wave.jpg');
		background-size: cover;
	}
}
.home-sketches-header {
    background: #4d4d4d;
    padding: 3%;
    text-align: center;
    box-shadow: 0 0 50px rgba(0,0,0,0.5) inset;
}
h1.home-sketches-title {
    color: #e8e8e8;
    text-shadow: 2px 2px 0 #000;
    font-size: 3.1em;
    line-height: 1;
    letter-spacing: 0.05em;
}
.home-sketch img {
    width: 100%;
    height: auto;
    opacity: 1;

    -moz-transition: opacity .25s ease-in-out;
    -webkit-transition: opacity .25s ease-in-out;
    -ms-transition: opacity .25s ease-in-out;
	transition: opacity .25s ease-in-out;
}
.home-sketch img:hover {
    opacity: 0.8;
}
@media screen and (max-width:767px) {
	h1.home-sketches-title {
		font-size: 1.4em;
		line-height: 1.3;
	}
}
.home-sketch {
	max-width:450px;
	margin:0 auto;
    text-align: center;
    padding-bottom: 3%;
}
.home-sketch > h2 {
    font-family: 'Arvo';
    font-weight: normal;
    font-size: 1em;
    padding: 1em 0.5em 2%;
    margin: 0;
}
.home-sketch > h2 > a {
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    display: block;
    overflow: hidden;
    color: #4e4e50;
    text-shadow: none;
    text-decoration: none;
}
.home-sketch p {
    color: #a0a0a0;
    margin: 0;
    text-transform: uppercase;
    font-size: 0.8em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.home-sketch p a {
	color: #a0a0a0;
	text-decoration:none;
}
.home-sketch p a:hover {
	color: #000;
	text-decoration:none;
}
@media screen and (min-width:450px) and (max-width:767px) {
	.home-sketch {
		background-color: #fff;
		margin: 3em auto !important;
		border-radius: 0.4em;
		box-shadow: 0 0 1em rgba(0, 0, 0, 0.19);
		overflow: hidden;
	}
}
@media screen and (min-width:768px) {
	.home-sketch {
		width: 25%;
		float: left;
	}
}
.tag-list a {
    display: inline-block;
    color: #EBEBEB;
    background: #B9B9B9;
    margin-right: 0.5em;
    margin-bottom: 0.5em;
    padding: 0.1em 0.5em 0.2em;
    border-radius: 0.25em;
    font-size: 0.9em;
    text-decoration: none;
}
.tag-list a:before {
    content: "\e028";
    font-family: 'icomoon';
    margin-right: 0.4em;
    position: relative;
    top: 0.1em;
}
.tag-list a:hover {
    background: #9E9E9E;
    color: #fff;
}
.tag-list {
    margin: 1em 0;
}
.category-list a {
    color: #CCCCCC;
    font-weight: 800;
    display: inline-block;
    padding-right: 0.4em;
    font-size: 1.4em;
    padding-left: 0.1em;
    /* top: 0.1em; */
    position: relative;
    text-decoration: none;
}
.single-footer {
	border-top: 2px dashed #D3D1D1;
	margin-top: 3em;
}
.category-list {
    font-family: 'Arvo'; font-weight: normal;
    font-size: 1.3em; padding: 0; position: relative;
    font-weight: 100; text-transform: uppercase;
    color: #D3D3D3;
    margin: 0.5em 0 1em;
    letter-spacing: 0.03em;
}
.category-list span {
    font-size: 1.4em;
    position: relative;
    top: 0.2em;
    display: inline-block;
    padding: 0 0.2em;
}
.entry-default {
    margin: 2% auto;
    width: 70%;
    font-size: 1.2em;
    line-height: 1.9;
    padding: 3% 5%;
    max-width: 800px;
}
.posts-listing-title {
    font-size: 2em;
    color: #999;
    text-shadow: none;
    letter-spacing: 0.05em;
    padding-bottom: 1em;
}
a.post-listing-header-link {
	color:#eee;
	font-family: 'Arvo';
	text-transform: uppercase;
	font-weight: bold;
	font-size: 0.9em;
	line-height: 0;
	letter-spacing: 0.015em;
	text-decoration: none;
}
a.post-listing-header-link:hover {
	color:#fff;
	text-shadow:none;
}
.posts-listing {
    text-align: center;
    overflow: visible;
    margin: 2.5%;
}
.post-listing-entry h2 {
    font-family: 'Arvo';
    font-weight: normal;
    font-size: 1.2em;
    margin-bottom: 0;
}
.post-listing-entry p {
    margin: 2em;
    margin-top: 0.3em;
    text-transform: uppercase;
    font-size: 0.75em;
    color: #aaa;
}
.post-listing-entry h2 a {
    color: #888;
    text-shadow: none;
}
.post-listing-entry img {
    opacity: 0.6;
    -moz-transition: opacity .25s ease-in-out;
    -webkit-transition: opacity .25s ease-in-out;
    -ms-transition: opacity .25s ease-in-out;
	transition: opacity .25s ease-in-out;
}
.post-listing-entry img:hover {
    opacity: 1;
}
.post-listing-footer a {
    font-size: 2em; color: #999; text-shadow: none; letter-spacing: 0.05em; padding-bottom: 1em;
    font-weight: 800;
    line-height: 1;
    font-family: 'Arvo'; font-weight: normal;
    text-decoration: none;
    font-weight: bold;
    text-transform: uppercase;
}
.post-listing-footer {
    margin: 3%;
    text-align: center;
}
.post-listing-footer a:hover {
    color: #777;
}
.post-listing-subtitle {
    display: block;
    font-family: 'Arvo';
    font-size: 0.6em;
    padding-bottom: 0.1em;
    letter-spacing: 0;
    text-transform: none;
    font-weight: normal;
}
.post-listing-icon {
    font-size: 1.5em;
    position: relative;
    top: 0.2em;
    padding-right: 0.1em;
    line-height: 0;
}
@media screen and (max-width:767px) {
	.entry-default-aside {
		display:none;
	}
	.entry-full, .entry-default {
		width: 92%;
		float:none;

		padding: 4%;
	}
	a.post-listing-header-link {
		font-size: 0.6em;
	}
	.entry-paged {
		margin: 3%;
		box-shadow: 0 0 0.2em rgba(0, 0, 0, 0.16);
		border-radius: 0.4em;
		overflow: hidden;
		background: #F5F5F5 !important;
		border: 2px solid #9B9B9B;
	}
}
.entry-paged-thumb {
    float: left;
    width: 33%;
    max-width: 450px;
    margin: 0 3% 0 0;
    line-height: 0;
	background-color: #999999;
    position: relative;
    text-align: center;
    z-index: 10;
}
.entry-paged {
    position: relative;
    overflow: hidden;
}
.entry-paged > * {
    position: relative;
}
.entry-paged h2 {
    padding-top: 3%;
    margin: 0;
    font-size: 2.5em;
    margin-right: 6%;
    text-transform: uppercase;
    line-height: 1;
}
.entry-paged h2 a {
    text-decoration: none;
}

.entry-paged:nth-child(even) {
	background:#ddd;
}
@media screen and (max-width:767px) {
	.entry-paged-thumb {
		float: none;
		width:100%;
		margin:0 auto;
		max-width: none;
	}
	.entry-paged h2, .entry-paged p {
		margin-left: 7%;
		margin-right: 7%;
		margin-top: 0.5em;}
	.entry-paged h2 {
		text-align:center;
		font-size:2em;
		margin: 0.2em 7% 0.4em;
	}
}
@media screen and (min-width:768px) {
	.entry-paged > * {
		margin-left:36%;
	}
	.entry-paged > .entry-paged-thumb {
		margin-left:0;
	}
}
@media screen and (min-width:768px) and (max-width:1150px) {
	@media screen and (min-width:768px) and (max-width:1150px) {
	    .entry-paged h2 {
	        font-size:1.8em;
	    }
	}
}
.next-prev {
    background: #4d4d4d;  text-align: center; box-shadow: 0 0 50px rgba(0,0,0,0.5) inset;
}
.next-prev a {
    color: #fff;
    font-family: 'Arvo';
    font-size: 3em;
    padding: 0.6em;
    display: inline-block;
}
.next-prev a:hover {
    text-decoration: underline;
}
@media screen and (max-width:767px) {
	.next-prev a {
		font-size:1.5em;
	}
}
.right {
    float: right;
}
.left {
    float: left;
}
.menu-logo {
    width: 192px;
    position: absolute;
    padding-left: 45px;
    padding-top: 5px;
    left: 0;
    top: 0;
}
.menu-logo img {
    width: 100%;
    height: auto;
}
.menu-links {
    margin-left: 274px;
    background: rgba(255,255,255,0.1);
}

@media screen and (max-width:767px) {
	.menu-logo {
		width: 100%;
		position: relative;
		padding: 9px 20px 7px;
		margin: 0 auto;
		max-width: 215px;
	}
	.menu-links {
		margin: 0;
	}
}
.menu-sublinks {
    list-style-type: none;
    margin: 0 auto;
    padding: 0;
    position: relative;
    transform: translateY(-100px);
    opacity: 0;
    transition: opacity 1000ms, transform 1000ms;
}
#menu-the-works, #menu-animations {
	text-align: center;
    line-height: 1.1;
    font-size: 20px;
	height: 400px;
    letter-spacing: 0.02em;
}
#menu-animations {
    max-width: 1000px;
}
#menu-the-works {
    max-width: 1200px;
}
#menu-the-works a:hover, #menu-animations a:hover {
    color: #333;
}
.menu-sublinks-container {
	height: 0;


	overflow:hidden;
}
.menu-sublinks-container.open {
	height: auto;
}
.menu-sublinks-container.open .menu-sublinks {
    opacity: 1;
    transform: translateY(0);
}
.menu-the-works-submenu-container {
	height:393px;

	border-bottom: #444 7px solid;

    box-shadow: 0 0 100px 15px rgba(0,138,255,0.3) inset;

    background: #ffffff; /* Old browsers */	 /* FF3.6+ */ /* Chrome,Safari4+ */ /* Chrome10+,Safari5.1+ */ /* Opera 11.10+ */ /* IE10+ */
	background: linear-gradient(to bottom, #ffffff 0%,#c2e3ff 100%); /* W3C */ /* IE6-9 */
}
.menu-animations-submenu-container {
	height:393px;

	border-bottom: #444 7px solid;

    box-shadow: 0 0 100px 15px rgba(0,138,255,0.3) inset;

    background: #4eaefa;
	background: -moz-linear-gradient(top,  #4eaefa 0%, #364eca 100%);
	background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#4eaefa), color-stop(100%,#364eca));
	background: -webkit-linear-gradient(top,  #4eaefa 0%,#364eca 100%);
	background: -o-linear-gradient(top,  #4eaefa 0%,#364eca 100%);
	background: -ms-linear-gradient(top,  #4eaefa 0%,#364eca 100%);
	background: linear-gradient(to bottom,  #4eaefa 0%,#364eca 100%);
	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4eaefa', endColorstr='#364eca',GradientType=0 );

}
.menu-links-home {
    margin-left: 0;
}
.menu-sublinks > li {
    position: absolute;
    text-transform: uppercase;
    font-family: 'Arvo';
    font-weight: bold;
    font-size: 1.5em;
	text-shadow: 1px 4px 0 rgba(0,0,0,0.1);

	-webkit-transition: 800ms -webkit-transform ease-in-out;
    -moz-transition: 800ms -moz-transform ease-in-out;
    -ms-transition: 800ms -ms-transform ease-in-out;
	transition: 800ms transform ease-in-out;
}
.close .menu-sublinks li {
	-webkit-transform: rotate(0deg) !important;
	-moz-transform: rotate(0deg) !important;
	-ms-transform: rotate(0deg) !important;
	transform: rotate(0deg) !important;
}
.menu-animations-submenu-container li {
	text-shadow: 4px 5px 0 rgba(0,0,0,0.3);
}
/* The Works Sub-Menu */
#menu-item-808 {
    top: 55%;
    left: 34%;
    width: 12em;

    -moz-transform: rotate(-8deg);
	-webkit-transform: rotate(-8deg);
	-ms-transform: rotate(-8deg);
	transform: rotate(-8deg);

	-moz-transition-duration: 1050ms;
    -webkit-transition-duration: 1050ms;
    -ms-transition-duration: 1050ms;
	transition-duration: 1050ms;
    font-size: 1.3em;
}
#menu-item-811 {
    top: 22%;
    left: 50%;
    width: 7em;

    -webkit-transform: rotate(13deg);
	-moz-transform: rotate(13deg);
	-ms-transform: rotate(13deg);
	transform: rotate(13deg);

	-webkit-transition-duration: 1150ms;
    -moz-transition-duration: 1150ms;
    -ms-transition-duration: 1150ms;
    transition-duration: 1150ms;

    font-size: 1.8em;
}
#menu-item-812 {
    top: 41%;
    left: 7%;

    -webkit-transform: rotate(-8deg);
	-moz-transform: rotate(-8deg);
	-ms-transform: rotate(-8deg);
	transform: rotate(-8deg);

	-webkit-transition-duration: 600ms;
	-moz-transition-duration: 600ms;
	-ms-transition-duration: 600ms;
	transition-duration: 600ms;

    font-size: 1.9em;
}
#menu-item-813 {
    top: 74%;
    left: 19%;
    -webkit-transform: rotate(12deg);
	-moz-transform: rotate(12deg);
	-ms-transform: rotate(12deg);
	transform: rotate(12deg);

	-webkit-transition-duration: 800ms;
    -moz-transition-duration: 800ms;
    -ms-transition-duration: 800ms;
    transition-duration: 800ms;

    font-size: 1.7em;
}
#menu-item-814 {
    top: 24%;
    left: 26%;
    width: 12em;
    -webkit-transform: rotate(16deg);
	-moz-transform: rotate(16deg);
	-ms-transform: rotate(16deg);
	transform: rotate(16deg);

	-webkit-transition-duration: 1200ms;
    -moz-transition-duration: 1200ms;
    -ms-transition-duration: 1200ms;
    transition-duration: 1200ms;

	font-size: 1em;
}
#menu-item-810 {
  top: 63%;
  left: 63%;
  width: 7em;

  -webkit-transform: rotate(-11deg);
  -moz-transform: rotate(-11deg);
  -ms-transform: rotate(-11deg);
  transform: rotate(-11deg);

  -webkit-transition-duration: 1000ms;
  -moz-transition-duration: 1000ms;
  -ms-transition-duration: 1000ms;
  transition-duration: 1000ms;

  font-size: 2.2em;
}
#menu-item-808 a {
    color: #c54041;
}
#menu-item-810 a {
    color: #e97c28;
}
#menu-item-811 a {
    color: #b82e4a;
}
#menu-item-812 a {
    color: #9e005d;
}
#menu-item-813 a {
    color: #c54041;
}
#menu-item-814 a {
    color: #ee9029;
}
/* Animation Sub-Menu */
#menu-item-815 {
    top: 27%;
    -webkit-transform: rotate(8deg);
    -moz-transform: rotate(8deg);
    -ms-transform: rotate(8deg);
    transform: rotate(8deg);
    left: 10%;
}
#menu-item-816 {
    right: 5%;
    bottom: 11%;
    width: 11em;
    -webkit-transform: rotate(7deg);
	-moz-transform: rotate(7deg);
	-ms-transform: rotate(7deg);
	transform: rotate(7deg);
}
#menu-item-817 {
    top: 65%;
    left: 7%;
    width: 8em;
    font-size: 1.8em;
    -webkit-transform: rotate(-9deg);
	-moz-transform: rotate(-9deg);
	-ms-transform: rotate(-9deg);
	transform: rotate(-9deg);
}
#menu-item-818 {
    top: 38%;
    right: 10%;
    font-size: 3em;
    -webkit-transform: rotate(-12deg);
	-moz-transform: rotate(-12deg);
	-ms-transform: rotate(-12deg);
	transform: rotate(-12deg);
}
#menu-item-815 a {
    color: #A0DEFF;
}
#menu-item-816 a {
    color: #c2e3ff;
}
#menu-item-817 a {
    color: #00c3ff;
}
#menu-item-818 a {
    color: #009dff;
}

/* Tag cloud responsive sizing */
@media screen and (max-width:400px) {
	#menu-the-works, #menu-animations {
		font-size: 9px;
	}
	#menu-the-works li, #menu-animations li {
		margin-left: -3%;
	}
}
@media screen and (min-width:401px) and (max-width:550px) {
	#menu-the-works, #menu-animations {
		font-size: 13px;
	}
	#menu-the-works li, #menu-animations li {
		margin-left: -3%;
	}
}
@media screen and (min-width:551px) and (max-width:767px) {
	#menu-the-works, #menu-animations {
		font-size: 17px;
	}
	#menu-the-works li, #menu-animations li {
		margin-left: -3%;
	}
}
/* Menu Arrows */
#menu-item-763 a, #menu-item-803 a {
    padding-left: 1em;
    position: relative;
}
#menu-item-763 a:after, #menu-item-803 a:after {
    content: "";
    position: absolute;
    width: 0px;
    top: 0;
    left: 0;
    margin-top: 0.6em;
    height: 0px; border-style: solid;
    border-width: 0.4em 0 0.4em 0.4em;
    border-color: transparent transparent transparent #fff;
}
#menu-item-763 a.open:after, #menu-item-803 a.open:after {
    margin-top: 0.8em;
    border-width: 0.4em 0.4em 0 0.4em;
    border-color: #fff transparent transparent transparent;
    left: -0.3em;
}
.full-featured-image {
    padding: 5%;
    padding-top: 4%;
    box-shadow: 0 0 1em rgba(0, 0, 0, 0.33) inset;
    overflow: hidden;
    border-top: 0.3em solid #818181;
    text-align: center;
    background: #444;
    background: linear-gradient(45deg,  #353535 0%,#666666 100%);
}
.full-featured-image-img {
    box-shadow: 0 0 1.3em rgba(0, 0, 0, 0.39);
    width: 100%;
}
.full-featured-image-title {
    color: #C2C2C2;
    text-shadow: 4px 4px 0 rgba(255, 255, 255, 0.08);
    font-size: 3.2em;
    margin-top: 0;
    margin-bottom: 0.9em;
}
.featured-video {
    background-color: #333;
    padding: 4% 6%;
    overflow: hidden;
    text-align: center;
    border-top: 0.7em solid #272727;
    border-bottom: 0.7em solid #555;
}
.featured-video-title {
	color: #D1D1D1;
	font-weight: normal;
	text-shadow: 0.13em 0.13em 0 rgba(0, 0, 0, 0.28);
	text-align: center;
	margin-top: 0;
	margin-bottom: 1em;
}
.featured-video video {
    max-width: 100%;
    height: auto;
    box-shadow: 0 0.1em 1em rgba(0, 0, 0, 0.55);
}
@media (min-width:1000px) {
	.featured-video video {
		box-shadow: 0 0.1em 2em rgba(0, 0, 0, 0.79);
	}
}
.vine {
	width: 100%;
	max-width: 600px;
	height: 600px;
	border: none;
}
.big-gallery-selector {
    background-color: #444;
    padding: 0;
    box-shadow: inset 0 0 200px rgba(0, 0, 0, 0.62);
    overflow: hidden;
	padding-bottom: 4%;
}
.big-gallery-thumbs .swiper-visible-switch {
}
.big-gallery-thumbs .swiper-active-switch {
    background: #C8C8C8;
    border-top-width: 0.3em;
}
.big-gallery-slide.swiper-slide-active {
    opacity: 1;
    -webkit-transform: scale(1);
}
.big-gallery-page-left, .big-gallery-page-right {
	background: #B9B9B9;
	width: 3em;
	height: 3em;
	border-radius:1.5em;
	overflow: hidden;
	text-indent: -300px;
	position:absolute;
	top:50%;
	margin-top: -1.5em;
	-webkit-transition:-webkit-transform 200ms;
	   -moz-transition:-moz-transform 200ms;
	    -ms-transition:-ms-transform 200ms;
	     -o-transition:-o-transform 200ms;
	        transition:transform 200ms;
	-webkit-transform:scale(1);
	   -moz-transform:scale(1);
	    -ms-transform:scale(1);
	     -o-transform:scale(1);
	        transform:scale(1);
	-webkit-transition-timing-function:;
	   -moz-transition-timing-function:;
	    -ms-transition-timing-function:;
	     -o-transition-timing-function:;
	        transition-timing-function:;
}
.big-gallery-page-left:hover, .big-gallery-page-right:hover {
	-webkit-transform:scale(1.2);
	   -moz-transform:scale(1.2);
	    -ms-transform:scale(1.2);
	     -o-transform:scale(1.2);
	        transform:scale(1.2);
}
.big-gallery-page-right {
	right: 2%;
}
.big-gallery-page-left {
	left: 2%;
}
.big-gallery-page-left:after, .big-gallery-page-right:after {
	content:"";
	position: absolute;
	top: 0.55em;
	width: 0; height: 0;
	border-style: solid;
}
.big-gallery-page-left:after {
	border-width: 1em 1em 1em 0;
	border-color: transparent #888 transparent transparent;
	left: 0.8em;
}
.big-gallery-page-right:after {
	border-width: 1em 0 1em 1em;
	border-color: transparent transparent transparent #888;
	left: 1.2em;
}
.big-gallery-selector-title {
	color: #D1D1D1;
	font-weight: normal;
	text-shadow: 4px 4px 0 rgba(255, 255, 255, 0.19);
	text-align: center;
}
.big-gallery-slide {
	opacity: 0.3;
	-webkit-transition: opacity 500ms;
	   -moz-transition: opacity 500ms;
	    -ms-transition: opacity 500ms;
	     -o-transition: opacity 500ms;
	        transition: opacity 500ms;

}
.big-gallery-slide.swiper-slide-active {
	opacity: 1;
}
.big-gallery-slide img {
	margin:0 2em;
	box-shadow: 0 0 2em rgba(0, 0, 0, 0.43);
}
.big-gallery-thumbs {
	text-align:center;
	bottom:0;
	width:100%;
	position:absolute;
}
@media screen and (max-width:399px)		{
	.big-gallery-slide img {
		margin: 0 0.5em;
	}
	.big-gallery-page-left, .big-gallery-page-right {
		display:none;
	}
}
@media screen and (max-width:599px)		{ .big-gallery-slide img { max-width:320px; max-height:180px; } .big-gallery-swiper { height:180px;} }
@media screen and (min-width:600px)		{ .big-gallery-slide img { max-width:500px; max-height:281px; } .big-gallery-swiper { height:281px;} }
@media screen and (min-width:800px)		{ .big-gallery-slide img { max-width:700px; max-height:393px; } .big-gallery-swiper { height:393px;} }
@media screen and (min-width:1000px)	{ .big-gallery-slide img { max-width:850px; max-height:478px; } .big-gallery-swiper { height:478px;} }
@media screen and (min-width:1200px)	{ .big-gallery-slide img { max-width:950px; max-height:534px; } .big-gallery-swiper { height:534px;} }

@media screen and (min-width:768px) and (max-width:1000px) {
    .big-gallery-page-right {
        right: 3%;
    }
    .big-gallery-page-left {
        left: 3%;
    }
}
@media screen and (max-width:767px) {
	.big-gallery-swiper {
	    height: 303px;
	}
	.big-gallery-slide {
		height:200px;
	}
	.big-gallery-page-left, .big-gallery-page-right {
		font-size: 0.7em;
	    top: 50%;
	}
}
@media screen and (max-width:599px) {
	.big-gallery-swiper {
		height: 190px;
	}
}
`
