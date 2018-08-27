import 'babel-polyfill';
import svg4everybody from 'svg4everybody';
import $ from 'jquery';
import html2canvas from 'html2canvas';

svg4everybody();

window.$ = $;
window.jQuery = $;

require('ninelines-ua-parser');
