document.addEventListener("DOMContentLoaded", () => {
  let bookSelectMenu = document.getElementById("book-selector");

  const setBookSelectOptions = () => {
    let optionList = bookSelectMenu.options;
    let options = [...Array(20).keys()].map(num => ({
      "text": (num + 1).toLocaleString(),
      "value": (num + 1).toLocaleString().padStart(2, "0")
    }));
    options[0].selected = true;

    options.forEach(option =>
      optionList.add(
        new Option(option.text, option.value, option.selected)
      )
    );
  };

  const loadText = () => {
    let a = new CETEI();
    let b = new CETEI();
    let c = new CETEI();
    let bookNum = document.getElementById("book-selector").value;

    a.getHTML5(`../assets/xml/Latin/book-${bookNum}.xml`, (data) => {
      // clear pane if text already loaded
      let pane = document.getElementById("left");
      pane.childNodes.forEach(node => {
        if (node.localName !== "h3") {
            pane.removeChild(node)
        }
      });
      document.getElementById("left").appendChild(data);
    });

    b.getHTML5(`../assets/xml/English/book-${bookNum}.xml`, (data) => {
      // clear pane if text already loaded
      let pane = document.getElementById("center");
      pane.childNodes.forEach(node => {
        if (node.localName !== "h3") {
            pane.removeChild(node)
        }
      });
      document.getElementById("center").appendChild(data);
    });

    c.getHTML5(`../assets/xml/Greek/book-${bookNum}.xml`, (data) => {
      // clear pane if text already loaded
      let pane = document.getElementById("right");
      pane.childNodes.forEach(node => {
        if (node.localName !== "h3") {
            pane.removeChild(node)
        }
      });
      document.getElementById("right").appendChild(data);
    });

  };

  setBookSelectOptions();
  loadText();
  bookSelectMenu.addEventListener("change", loadText);
});
