var fs = require('fs');
var Inflect = require('i')();


module.exports = function Templater () {
  //Syntax:
  //num:         Just a number
  //t-num:       Number optionally preceded by "The"
  //x-num:       Random number that the system doesn't care about
  //sup-adj:     Superlative adjective
  //adj:         Regular adjective
  //subj:        plural noun
  //noun:        plural noun not used as subject
  //people:      plural noun describing a group of people (eg. "Children")
  //p-subj:      same as people noun, but used instead of subj
  //crazy:       adjectives expressing craziness
  //pred:        mark question as true/false (replaced with "")
  //
  //Every template must contain [[subj]] or [[p-subj]]
  //  and either [[num]] or [[t-num]]

  var templates = {};

  this.loadBuzzTitles = function(){
    var templates = [
      "The [[num]] [[sup-adj]] [[subj]] In The World",
      "The [[num]] [[sup-adj]] [[subj]] Of Last Summer",
      "The [[num]] [[sup-adj]] [[subj]] Of The 90's",
      "The [[num]] [[sup-adj]] [[subj]] Of The Last [[x-num]] Years",
      "The [[num]] [[sup-adj]] [[subj]] Of This Century",
      "The [[num]] [[sup-adj]] [[subj]] Only [[people]] Will Understand",
      "The [[num]] [[sup-adj]] [[subj]] That Will Make You Laugh Every Time",
      "The [[num]] [[sup-adj]] [[subj]] You Probably Didn't Know",
      "[[num]] Things [[p-subj]] Should Be Allowed To Complain About",
      "[[num]] Times [[subj]] Are The Worst And You Just Can't Even",
      "[[num]] [[p-subj]] With Excellent New Year's Resolutions",
      "[[num]] [[subj]] For [[people]] That Should Really Exist",
      "[[t-num]] Things [[p-subj]] Know To Be True",
      "[[t-num]] [[adj]] [[subj]] That Will Make You Ask \"Why?\"",
      "[[t-num]] [[adj]] [[subj]] You Probably Didn't Know",
      "[[t-num]] [[crazy]] Things [[p-subj]] Know To Be True",
      "[[t-num]] [[p-subj]] Who Are Clearly Being Raised [[adj]]",
      "[[t-num]] [[p-subj]] Who Are Having A Really Rough Day",
      "[[t-num]] [[p-subj]] Who Are Too Clever For Their Own Good",
      "[[t-num]] [[p-subj]] Who Completely Screwed Up Their One Job",
      "[[t-num]] [[p-subj]] Who Have Performed For [[people]]",
      "[[t-num]] [[p-subj]] Who Need To Be Banned From Celebrating Halloween",
      "[[t-num]] [[p-subj]] Who Will Make You Feel Like A Genius",
      "[[t-num]] [[subj]] That Scream World Domination"
    ];
  };


  var dicts = {};
  var minNum = 10;
  var maxNum = 42;

  function loadFile(key, file, callback){
    fs.readFile(file, 'utf8', function (err,data) {
      if (err) {
        return console.error(err);
      }
      dicts[key] = data.split("\n");
      callback();
    });
  }

  this.loadKey = function(key, list){
    dicts[key] = list;
  };

  function loadData(){
    // Mmmm serial loading...
    loadFile("sup-adj", "wordlists/sup-adj.txt", function () {
      loadFile("adj", "wordlists/adj.txt", function () {
        loadFile("subj", "wordlists/nouns.txt", function () {
          loadFile("people", "wordlists/people-nouns.txt", function () {
            loadFile("crazy", "wordlists/crazy-adj.txt", function () {
              dicts["sn-subj"] = dicts["subj"].map(function(x){Inflect.singularize(x);});
            });
          });
        });
      });
    });
  }
  loadData();

  function genFromTemplate(template){
    var match;
    var inner;
    var ret = {};
    while (!!(match = template.match(/\[\[[^\]]+]]/))){
      match = match[0];
      inner = match.substr(2, match.length-4);
      if (inner === "num"){
        ret.num = rand(minNum, maxNum);
        template = replaceMatch(template, match, ""+ret.num);
      } else if (inner === "t-num"){
        ret.num = rand(minNum, maxNum);
        template = replaceMatch(template, match, "The "+ret.num);
      } else if (inner === "x-num"){
        template = replaceMatch(template, match, ""+rand(minNum,maxNum));
      } else if (inner === "pred"){
        ret.isPred = true;
        template = replaceMatch(template, match, "");
      } else if (inner === "noun"){
        inner = "subj";
        var n = dicts[inner][rand(0,dicts[inner].length)];
        template = replaceMatch(template, match, n);
      } else if (inner === "subj"){
        ret.subj = dicts[inner][rand(0,dicts[inner].length)];
        template = replaceMatch(template, match, ret.subj);
      } else if (inner === "sn-subj"){
        ret.subj = dicts[inner][rand(0,dicts[inner].length)];
        template = replaceMatch(template, match, ret.subj);
      } else if (inner === "p-subj"){
        inner = "people";
        ret.subj = dicts[inner][rand(0,dicts[inner].length)];
        template = replaceMatch(template, match, ret.subj);
      } else {
        template = replaceMatch(template, match, dicts[inner][rand(0,dicts[inner].length)]);
      }
    }
    ret.title = template;
    return ret;
  }

  this.generateName = function(){
    var template = templates[rand(0,templates.length)];
    var ret = genFromTemplate(template);
    ret.articleName = ret.title.toLowerCase().replace(/ /g, "-").replace(/[\"\']/g, "");
    return ret;
  };

  function rand(min, max){
    return Math.floor(Math.random() * (max-min))+min;
  }

  function replaceMatch(fullString, match, substitute){
    var start = fullString.indexOf(match);
    var newStr = fullString.slice(0,start) + substitute +
          fullString.slice(start + match.length, fullString.length);
    return newStr;
  }
};
