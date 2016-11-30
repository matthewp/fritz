class HTMLParser {
  constructor() {
    this.state = [];
    this.current = null;
    this.inTag = false;
    this.inAttr = false;
  }

  parse(str) {
    var idx = 0;
    var len = str.length;
    var ch;

    while(idx < len) {
      ch = str[idx];
      this.tokenize(ch);
     
      idx++;
    }
  }

  tokenize(ch) {
    switch(ch) {
      case '<':
        this.inTag = true;
        this.current = {children: [],closed: false};
        this.state.push(this.current);
        break;
      case '>':
        if(this.inTag) {
          this.inTag = false;
        }
        break;
      case '/':
        break;
      case ' ':
        break;
      default:
        if(this.inTag) {
          this.current.tagName += ch;
        }
        break;
    }
  }
}
