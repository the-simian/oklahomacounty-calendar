const test =
  '<font face="Tahoma" size="2">\n                                        <span style="white-space: nowrap;">\n                                            \n                                            \n                                            \n                                        </span>\n                                    </font>';
function clean(html) {
  return html.replace(/ +(?= )/g, "").replace(/(\r\n|\n|\r)/gm, "");
}

var newHtml = clean(test);

console.log(newHtml);
