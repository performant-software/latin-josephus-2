document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const bookSelectMenu = document.getElementById("book-selector");
  const chapterSelectForm = document.querySelector("#chapter-select form");
  const sectionSelectForm = document.querySelector("#section-select form");
  const chapterSelectMenu = document.getElementById("chapter-selector");
  const sectionSelectMenu = document.getElementById("section-selector");
  const viewingLevelSelectMenu = document.getElementById("level-select");
  const latinPane = document.getElementById("latin");
  const englishPane = document.getElementById("english");
  const greekPane = document.getElementById("greek");
  const englishPaneCheckbox = document.getElementById("english-pane-select");
  const greekPaneCheckbox = document.getElementById("greek-pane-select");

  let latinData;
  let englishData;
  let greekData;

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

  const loadText = async () => {
    const tei = new CETEI();
    const bookNum = bookSelectMenu.value;
    const chapterNum = chapterSelectMenu.value;
    const sectionNum = sectionSelectMenu.value;
    const viewingLevel = document.querySelector('input[name="level-options"]:checked').value;

    await tei.getHTML5(`../assets/xml/Latin/book-${bookNum}.xml`, (data) => {
      latinData = data;
      let latinChapters = [];
      latinData.getElementsByTagName("tei-div2").forEach(el => {
        chapterNumber = parseInt(el.id.split("-")[2].replace("chapter",""));
        latinChapters.push(chapterNumber);
      });
      setChapterSelectOptions(latinChapters);
      if (chapterNum) {
        let chapterSections = [];
        chapter = latinData.querySelector(`[id*="latin-book${bookNum}-chapter${chapterNum}"]`);
        chapter.getElementsByTagName("tei-p").forEach(el => {
          sectionNumber = parseInt(el.id.split("-")[2].replace("num",""));
          chapterSections.push(sectionNumber);
        })
        setSectionSelectOptions(chapterSections.sort());
      }
    });
    await tei.getHTML5(`../assets/xml/English/book-${bookNum}.xml`, (data) => {
      englishData = data;
    });
    await tei.getHTML5(`../assets/xml/Greek/book-${bookNum}.xml`, (data) => {
      greekData = data;
    });

    // clear panes if text already loaded
    [latinPane, englishPane, greekPane].forEach(pane => {
      pane.childNodes.forEach(node => {
        if (node.localName !== "h3") {
          pane.removeChild(node)
        }
      });
    });

    switch(viewingLevel) {
      case "book-level":
        selectedLatinData = latinData;
        selectedEnglishData = englishData;
        selectedGreekData = greekData;
        break;
      case "chapter-level":
        selectedLatinData = latinData.querySelector(`[id*="latin-book${bookNum}-chapter${chapterNum}"]`);
        selectedEnglishData = englishData.querySelector(`[sameAs*="latin-book${bookNum}-chapter${chapterNum}"]`);
        selectedGreekData = greekData.querySelector(`[sameAs*="latin-book${bookNum}-chapter${chapterNum}"]`);
        break;
      case "section-level":
        selectedLatinData = latinData.querySelector(`[id*="latin-book${bookNum}-num${sectionNum}"]`);
        selectedEnglishData = englishData.querySelector(`[sameAs*="latin-book${bookNum}-num${sectionNum}"]`);
        selectedGreekData = greekData.querySelector(`[sameAs*="latin-book${bookNum}-num${sectionNum}"]`);
      break;
    };

    latinPane.appendChild(selectedLatinData);
    englishPane.appendChild(selectedEnglishData);
    greekPane.appendChild(selectedGreekData);
  };

  const isInViewRange = (elem, container) => {
    const containerBounds = container.getBoundingClientRect();
    const { top, bottom } = elem.getBoundingClientRect();
    return (top <= containerBounds.bottom && bottom >= containerBounds.top);
  }

  const setChapterSelectOptions = (chapters) => {
    let optionList = chapterSelectMenu.options;
    optionList.length = 0;
    let options = chapters.map(num => ({
      "text": (num + 1).toLocaleString(),
      "value": (num + 1).toLocaleString()
    }));
    options[0].selected = true;

    options.forEach(option =>
      optionList.add(
        new Option(option.text, option.value, option.selected)
      )
    );
  };

  const setSectionSelectOptions = (sections) => {
    let optionList = sectionSelectMenu.options;
    optionList.length = 0;
    let options = sections.map(num => ({
      "text": (num + 1).toLocaleString(),
      "value": (num + 1).toLocaleString()
    }));
    options[0].selected = true;

    options.forEach(option =>
      optionList.add(
        new Option(option.text, option.value, option.selected)
      )
    );
  };

  // Add event listeners
  const addEventListeners = () => {
    [
      bookSelectMenu,
      chapterSelectMenu,
      sectionSelectMenu
    ].forEach(
      element => element.addEventListener("change", loadText)
    );

    viewingLevelSelectMenu.addEventListener("change", (event) => {
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
      loadText;
    });

    [
      [englishPaneCheckbox, englishPane],
      [greekPaneCheckbox, greekPane]
    ].forEach(
      el => el[0].addEventListener("change", () => el[1].classList.toggle("hidden"))
    )

  };

    addEventListeners();
    setBookSelectOptions();
    loadText();

});
