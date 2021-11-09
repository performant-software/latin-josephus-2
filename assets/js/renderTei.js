document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const annotationsList = document.getElementById("annotations-list");
  const bookLabel = document.getElementById("book-label");
  const bookSelectForm = document.querySelector("#book-select form");
  const bookSelectMenu = document.getElementById("book-selector");
  const chapterLabel = document.getElementById("chapter-label");
  const chapterSelectForm = document.querySelector("#chapter-select form");
  const chapterSelectMenu = document.getElementById("chapter-selector");
  const englishPane = document.getElementById("english");
  const englishPaneCheckbox = document.getElementById("english-pane-select");
  const greekPane = document.getElementById("greek");
  const greekPaneCheckbox = document.getElementById("greek-pane-select");
  const highlightCheckbox = document.getElementById("highlight-annotations");
  const latinPane = document.getElementById("latin");
  const sectionLabel = document.getElementById("section-label");
  const sectionSelectForm = document.querySelector("#section-select form");
  const sectionSelectMenu = document.getElementById("section-selector");
  const viewingLevelSelectMenu = document.getElementById("level-select");

  const tei = new CETEI();

  let annotatedParagraphs;
  let englishData;
  let greekData;
  let latinData;
  let fullLatinData;
  let fullEnglishData;
  let fullGreekData;

  let state = {
    bookNum: "01",
    chapterNum: null,
    // highlightAnnotations: false,
    sectionNum: null,
    viewingLevel: 'book-level'
  };

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

  const fetchData = async () => {

    await tei.getHTML5(`../assets/xml/Latin/book-${state.bookNum}.xml`, (data) => {
      fullLatinData = data;
    });

    await tei.getHTML5(`../assets/xml/English/book-${state.bookNum}.xml`, (data) => {
      fullEnglishData = data;
    });

    await tei.getHTML5(`../assets/xml/Greek/book-${state.bookNum}.xml`, (data) => {
      fullGreekData = data;
    });

    switch(state.viewingLevel) {
      case "book-level":
        latinData = fullLatinData;
        englishData = fullEnglishData;
        greekData = fullGreekData;
        break;
      case "chapter-level":
        latinData = state.chapterNum ? fullLatinData.querySelector(`[id*="latin-book${state.bookNum}-chapter${state.chapterNum}"]`) : fullLatinData;
        englishData = state.chapterNum ? fullEnglishData.querySelector(`[sameAs*="latin-book${state.bookNum}-chapter${state.chapterNum}"]`) : fullEnglishData;
        greekData = state.chapterNum ? fullGreekData.querySelector(`[sameAs*="latin-book${state.bookNum}-chapter${state.chapterNum}"]`) : fullGreekData;
        break;
      case "section-level":
        latinData = state.sectionNum ? fullLatinData.querySelector(`[id*="latin-book${state.bookNum}-num${state.sectionNum}"]`) : state.chapterNum ? fullLatinData.querySelector(`[id*="latin-book${state.bookNum}-chapter${state.chapterNum}"]`) : fullLatinData;
        englishData = state.sectionNum ? fullEnglishData.querySelector(`[sameAs*="latin-book${state.bookNum}-num${state.sectionNum}"]`) : state.chapterNum ? fullEnglishData.querySelector(`[sameAs*="latin-book${state.bookNum}-chapter${state.chapterNum}"]`) : fullEnglishData;
        greekData = state.sectionNum ? fullGreekData.querySelector(`[sameAs*="latin-book${state.bookNum}-num${state.sectionNum}"]`) : state.chapterNum ? fullGreekData.querySelector(`[sameAs*="latin-book${state.bookNum}-chapter${state.chapterNum}"]`) : fullGreekData;
      break;
    };
    parseAnnotations();
    setChapterSelectOptions();
    setSectionSelectOptions();
  };

  const renderUI = () => {
    // clear panes if text already loaded
    [latinPane, englishPane, greekPane].forEach(pane => {
      pane.childNodes.forEach(node => {
        if (node.localName !== "h3") {
          pane.removeChild(node)
        }
      });
    });

    englishPane.appendChild(englishData);
    greekPane.appendChild(greekData);
    latinPane.appendChild(latinData);

    bookLabel.innerText = `Book ${state.bookNum}`;
    chapterLabel.innerText = (state.chapterNum && state.viewingLevel !== "book-level") ? `Chapter ${state.chapterNum}` : '';
    sectionLabel.innerText = (state.sectionNum && state.viewingLevel === "section-level") ? `Section ${state.sectionNum}` : '';
  };

  // const isInViewRange = (elem, container) => {
  //   const containerBounds = container.getBoundingClientRect();
  //   const { top, bottom } = elem.getBoundingClientRect();
  //   return (top <= containerBounds.bottom && bottom >= containerBounds.top);
  // }

  const parseAnnotations = () => {
    annotations = latinData.getElementsByTagName("tei-listannotation");
    annotatedParagraphs = [];
    htmlString = '';

    annotations.forEach(anno => {
      paragraphId = anno.id.replace("note", "latin");
      annotatedParagraphs.push(paragraphId);
      htmlString += `<br /><b>${paragraphId}</b> <br />`
      anno.children.forEach(child => {
        witnessText = latinData.querySelector(`[id*="${child.attributes.source.value.replace("#","")}"]`).innerText;
        if (child.attributes.source.value !== "#FlaviusJosephusAntiquities") {
          htmlString += `${witnessText}: <em>${child.innerText}</em> <br />`
        }
      })
    });
    annotationsList.innerHTML = htmlString;
  };

  const setChapterSelectOptions = () => {
    if (state.viewingLevel === "book-level" || state.chapterNum) return;

    let latinChapters = [];
    fullLatinData.getElementsByTagName("tei-div2").forEach(el => {
      chapterNumber = parseInt(el.id.split("-")[2].replace("chapter",""));
      latinChapters.push(chapterNumber);
    });
    let optionList = chapterSelectMenu.options;
    optionList.length = 0;
    let options = latinChapters.map(num => ({
      "text": (num).toLocaleString(),
      "value": (num).toLocaleString()
    }));
    options.unshift({
      "text": '',
      "value": ''
    });

    options.forEach(option =>
      optionList.add(
        new Option(option.text, option.value, option.selected)
      )
    );
  };

  const setSectionSelectOptions = () => {
    if (state.viewingLevel !== "section-level" || state.sectionNum) return;

    let sections = [];
    fullLatinData.getElementsByTagName("tei-p").forEach(el => {
      let sectionNumber = parseInt(el?.id?.split("-")[2]?.replace("num",""));
      if (sectionNumber) { sections.push(sectionNumber) }
    });
    let optionList = sectionSelectMenu.options;
    optionList.length = 0;
    let options = sections.map(num => ({
      "text": (num).toLocaleString(),
      "value": (num).toLocaleString()
    }));
    options.unshift({
      "text": '',
      "value": ''
    });

    options.forEach(option =>
      optionList.add(
        new Option(option.text, option.value, option.selected)
      )
    );
  };

  const reload = async () => {
    await fetchData();
    renderUI();
  }

  const setState = async (callback) => {
    await callback();
    reload();
    console.log(state)
  };

  // Add event listeners
  const addEventListeners = () => {

    bookSelectMenu.addEventListener("change", (event) => {
      bookLabel.innerText = `Book ${parseInt(event.target.value)}`
      setState(() => {
        state.bookNum = event.target.value;
        state.chapterNum = null;
        state.sectionNum = null;
      });
    });

    chapterSelectMenu.addEventListener("change", (event) => {
      chapterLabel.innerText = `Chapter ${parseInt(event.target.value)}`
      setState(() => {
        state.chapterNum = event.target.value;
        state.sectionNum = null;
      });
    });

    sectionSelectMenu.addEventListener("change", (event) => {
      sectionLabel.innerText = `Section ${parseInt(event.target.value)}`
      setState(() => { state.sectionNum = event.target.value });
    });

    viewingLevelSelectMenu.addEventListener("change", (event) => {
      setState(() => {
        state.viewingLevel = event.target.value;
      });

      switch(event.target.value) {
        case "book-level":
          chapterSelectForm.classList.add("hidden");
          sectionSelectForm.classList.add("hidden");
          break;
        case "chapter-level":
          chapterSelectForm.classList.remove("hidden");
          sectionSelectForm.classList.add("hidden");
          break;
        case "section-level":
          chapterSelectForm.classList.remove("hidden");
          sectionSelectForm.classList.remove("hidden");
          break;
      };
    });

    [
      [englishPaneCheckbox, englishPane],
      [greekPaneCheckbox, greekPane]
    ].forEach(
      el => el[0].addEventListener("change", () => el[1].classList.toggle("hidden"))
    );

    highlightCheckbox.addEventListener("change", () => {
      annotatedParagraphs.forEach(paragraphId => document.getElementById(paragraphId).classList.toggle("highlight"));
      console.log("check")
    });

  };

  addEventListeners();
  reload();
  setBookSelectOptions();

});

// var timer;
//
// $(window).scroll(function() {
// 	if(timer) {
// 		window.clearTimeout(timer);
// 	}
//
// 	timer = window.setTimeout(function() {
// 		// actual callback
// 		console.log( "Firing!" );
// 	}, 100);
// });
