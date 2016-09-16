module.exports =
`body > margin {
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
`;
