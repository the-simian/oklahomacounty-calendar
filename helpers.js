const hours = (n) => n * 60 * 60 * 1000;

const titleCase = (str) => {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};

module.exports = {
  hours,
  titleCase,
};
