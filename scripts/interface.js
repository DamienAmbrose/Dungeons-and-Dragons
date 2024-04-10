class Profile {
    static activeIndex = 0;
    static list = [];

    static get ActiveElement() {
        return this.list[this.activeIndex];
    }

    static set ActiveElement(profile) {
        this.list[this.activeIndex] = profile;
    }

    static get TabList() {
        var tabList = [];
        for (const currentProfile of this.list)
            tabList.push(currentProfile.Tab);

        return tabList;
    }

    static get Count() {
        return this.list.length;
    }

    get Index() {
        return Profile.list.indexOf(this);
    }

    get Tab() {
        return tabContainer.children[Profile.list.indexOf(this)];
    }

    constructor(name) {
        this.name = name;
    }

    rollHistory = [];

    backstory = "";
    class = "";
    classLevel = 1;
    background = "";
    playerName = "";
    race = "";
    alignment = "";
    xp = 0;

    proficiencyBonus = 2;
    savingThrowMultipliers = {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 0,
        "wis": 0,
        "cha": 0
    };
    abilityScores = {
        "str": 10,
        "dex": 10,
        "con": 10,
        "int": 10,
        "wis": 10,
        "cha": 10
    };
}

const hoverableElements = document.querySelectorAll('input, button, .clickable, .tab, label');
let hoverVolume = 0.01;
let clickVolume = 0.07;
let interact = false;

for (const element of hoverableElements) {
    element.addEventListener("mouseover", function () {
        if (!interact) return;
        const hoverSFX = new Audio('audio/sfx/Click.wav');
        hoverSFX.volume = hoverVolume;
        hoverSFX.play();
    });
    element.addEventListener("mousedown", function () {
        interact = true;
        const clickSFX = new Audio('audio/sfx/Click.wav');
        clickSFX.volume = clickVolume;
        clickSFX.play();
    });
}


function NotImplemented() {
    ShowPopUp('Not Implemented', 'This feature is still work in progress. Try messing around with something else', 'Close', 'Okay');
}

var tabContainer = document.querySelector('.tabs');
var tabCounter = document.querySelector('.tabCounter');
var tabUI = tabContainer.firstElementChild.outerHTML;
var tabRenamer = document.querySelector('.characterName');
var sheetRenamer = document.querySelector('.sheetName');

Profile.list.push(new Profile("Dungeon Master"));

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && (event.key === "T" || event.shiftKey && event.key === "t")) {
        NewTab();
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && (event.key === "W" || event.shiftKey && event.key === "w")) {
        RequestDeleteTab(Profile.ActiveElement.Tab);
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") Escape();
});

function Escape() {
    HidePopUp();
    CloseSettings();
    CloseSheet();
}


let loader = document.querySelector('.loader');
let loaderMask = document.querySelector('.loaderMask');
window.addEventListener("load", function () {
    setTimeout(function () {
        loaderMask.style.height = '100vh';
    }, 2000);
    setTimeout(function () {
        loader.style.opacity = '0';
        loader.style.zIndex = '-6';
    }, 3000);
    SelectActiveTab();
    DisableChildren(settingsMenu);
    DisableChildren(sheetMenu);
});

function NewTab() {
    if (Profile.list.length >= 99) return;

    Profile.list.push(new Profile("New Character (" + Profile.Count + ")"));
    tabContainer.innerHTML += tabUI;

    UpdateSheets();
    SelectActiveTab();

    Profile.TabList[(Profile.Count - 1)].firstElementChild.focus();
    SelectTab(Profile.TabList[Profile.Count - 1])
}

let backstoryField = document.getElementById("backstoryField");
let classDropdown = document.getElementById("classDropdown");
let classLevelField = document.getElementById("levelField");
let playerNameField = document.getElementById("playerNameField");
let raceDropdown = document.getElementById("raceDropdown");
let backgroundField = document.getElementById("backgroundField");
let alignmentDropdown = document.getElementById("alignmentDropdown");
let xpField = document.getElementById("xpField");

let savingThrowProficiencies = {
    'str': document.querySelector("#str_savingThrowBox .savingThrowProficiencyDisplay"),
    'dex': document.querySelector("#dex_savingThrowBox .savingThrowProficiencyDisplay"),
    'con': document.querySelector("#con_savingThrowBox .savingThrowProficiencyDisplay"),
    'int': document.querySelector("#int_savingThrowBox .savingThrowProficiencyDisplay"),
    'wis': document.querySelector("#wis_savingThrowBox .savingThrowProficiencyDisplay"),
    'cha': document.querySelector("#cha_savingThrowBox .savingThrowProficiencyDisplay")
};

let abilityScoreInputs = {
    'str': document.getElementById("strScore"),
    'dex': document.getElementById("dexScore"),
    'con': document.getElementById("conScore"),
    'int': document.getElementById("intScore"),
    'wis': document.getElementById("wisScore"),
    'cha': document.getElementById("chaScore")
}

function UpdateSheets() {
    for (const tab of Profile.TabList) {
        const index = Profile.TabList.indexOf(tab);
        tab.firstElementChild.value = Profile.list[index].name;
    }

    tabRenamer.value = Profile.ActiveElement.name;
    sheetRenamer.value = Profile.ActiveElement.name;

    backstoryField.value = Profile.ActiveElement.backstory;
    classLevelField.value = Profile.ActiveElement.classLevel;
    playerNameField.value = Profile.ActiveElement.playerName;
    backgroundField.value = Profile.ActiveElement.background;
    xpField.value = Profile.ActiveElement.xp;

    DropdownSelectFromString(classDropdown, Profile.ActiveElement.class);
    DropdownSelectFromString(raceDropdown, Profile.ActiveElement.race);
    DropdownSelectFromString(alignmentDropdown, Profile.ActiveElement.alignment);

    for (const modifierName of ABILITY_NAMES) {
        abilityScoreInputs[modifierName].value = Profile.ActiveElement.abilityScores[modifierName];
        
        UpdateSavingThrowProficiency(savingThrowProficiencies[modifierName], modifierName, PROFICIENCY_MULTIPLIER_TO_INDEX[Profile.ActiveElement.savingThrowMultipliers[modifierName]]);
        UpdateAbility(abilityScoreInputs[modifierName], modifierName)
    }
}

function SelectActiveTab() {
    if (Profile.activeIndex >= Profile.Count)
        Profile.activeIndex = Profile.Count - 1;
    if (Profile.activeIndex < 0)
        Profile.activeIndex = 0;

    UpdateSheets();

    Profile.list.forEach(profile => {
        profile.Tab.classList.remove('active');
    });
    Profile.ActiveElement.Tab.classList.add('active');

    tabCounter.innerHTML = Profile.Count;
}

function SelectTab(tab) {
    Profile.activeIndex = Profile.TabList.indexOf(tab);
    UpdateHistory();
    SelectActiveTab();
}

function RequestUploadActiveProfile() {
    ShowPopUp('Overwrite Character?', 'This will permanently replace "' + Profile.ActiveElement.name + '"! Make sure to backup to JSON first', 'Cancel', 'Overwrite');
    popUpPositive.onclick = function () {
        UploadActiveProfile();
    };
}

function RequestDeleteTab(tab) {
    if (Profile.list.length == 1) return;

    var profile = Profile.list[Profile.TabList.indexOf(tab)];
    ShowPopUp('Delete Character?', 'This will permanently delete "' + profile.name + '"! Make sure to backup to JSON first', 'Cancel', 'Delete');
    popUpPositive.onclick = function () {
        DeleteTab(profile);
    };
}

function DeleteTab(profile) {
    index = Profile.list.indexOf(profile);

    if (index < Profile.activeIndex)
        Profile.activeIndex--;

    Profile.list[index].Tab.remove();
    Profile.list.splice(index, 1);

    SelectActiveTab();
    HidePopUp();
    return;
}

function DownloadActiveProfile() {
    Download(Profile.ActiveElement.name + " Profile Backup (" + new Date().getTime() + ")",
        JSON.stringify(Profile.ActiveElement));
}

function Download(fileName, content) {
    var anchor = document.createElement('a');
    anchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    anchor.setAttribute('download', fileName + '.json');
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

var uploader;
var file;
var content;
function UploadActiveProfile() {
    uploader = document.createElement('input');
    uploader.setAttribute('type', 'file');
    uploader.setAttribute('accept', '.json');
    uploader.style.display = 'none';

    document.body.append(uploader);
    uploader.addEventListener('change', HandleUpload);
    uploader.click();

    HidePopUp();
}

function HandleUpload(event) {
    const selectedFiles = event.target.files;

    if (selectedFiles.length > 0) file = selectedFiles[0];

    document.body.removeChild(uploader);

    var reader = new FileReader();

    reader.onload = function () {
        try {
            parseResult = JSON.parse(reader.result);
            Profile.ActiveElement.name = parseResult.name;
            Profile.ActiveElement.rollHistory = parseResult.rollHistory;
            Profile.ActiveElement.backstory = parseResult.backstory;
            Profile.ActiveElement.class = parseResult.class;
            Profile.ActiveElement.classLevel = parseResult.classLevel;
            Profile.ActiveElement.background = parseResult.background;
            Profile.ActiveElement.playerName = parseResult.playerName;
            Profile.ActiveElement.race = parseResult.race;
            Profile.ActiveElement.alignment = parseResult.alignment;
            Profile.ActiveElement.xp = parseResult.xp;
            Profile.ActiveElement.savingThrows = parseResult.savingThrowMultipliers;
            Profile.ActiveElement.abilityScores = parseResult.abilityScores;

            UpdateHistory();
        } catch {
            ShowPopUp('Upload Error', 'The file you uploaded was either not a compatible JSON file or was corrupted', 'Close', 'Okay');
        }

        UpdateSheets();
    };

    if (file != null) reader.readAsText(file);
}

var popUpContainer = document.querySelector('.popUpContainer');
var popUpElement = document.querySelector('.popUp');
var popUpTitle = document.querySelector('.popUpTitle');
var popUpContent = document.querySelector('.popUpContent');
var popUpPositive = document.querySelector('.popUpButtonTrue');
var popUpNegative = document.querySelector('.popUpButtonFalse');

let popVolume = 0.2;
function ShowPopUp(title, content, negative, positive) {
    const popSFX = new Audio('audio/sfx/Pop.wav');
    popSFX.volume = popVolume;
    popSFX.play();

    DisableChildren(main);
    EnableChildren(popUpContainer);
    popUpPositive.focus();

    popUpContainer.style.opacity = '1';
    popUpContainer.style.zIndex = '5';
    popUpElement.style.transform = 'scale(1)';

    popUpTitle.innerHTML = title;
    popUpContent.innerHTML = content;

    popUpNegative.innerHTML = negative;
    popUpPositive.innerHTML = positive;
}

function HidePopUp() {
    popUpContainer.style.opacity = '0';
    popUpContainer.style.zIndex = '-5';
    popUpElement.style.transform = 'scale(0.5)';

    popUpPositive.setAttribute('onclick', 'HidePopUp()');
    popUpNegative.setAttribute('onclick', 'HidePopUp()');

    EnableChildren(main);
    DisableChildren(popUpContainer);
}

var settingsMenu = document.querySelector('.settingsPanel');
function OpenSettings() {
    settingsMenu.style.transform = 'translateX(0%)';

    DisableChildren(main);
    EnableChildren(settingsMenu);
}

function CloseSettings() {
    settingsMenu.style.transform = 'translateX(-110%)';

    EnableChildren(main);
    DisableChildren(settingsMenu);
}

var sheetMenu = document.querySelector('.sheetPanel');
function OpenSheet() {
    sheetMenu.style.transform = 'translateX(calc(100vw - 100% - 1em))';

    DisableChildren(main);
    EnableChildren(sheetMenu);
}

function CloseSheet() {
    sheetMenu.style.transform = 'translateX(100vw)';

    EnableChildren(main);
    DisableChildren(sheetMenu);
}

function ToggleSettingGroup(group, arrow) {
    if (group.classList.contains('active')) {
        DisableChildren(group);
        group.classList.remove('active');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        EnableChildren(group);
        group.classList.add('active');
        arrow.style.transform = 'rotate(90deg)';
    }
}

var main = document.querySelector('main');
var disablePage = document.querySelector('.disablePage');
function DisableChildren(element) {
    if (element == document.querySelector('main')) {
        disablePage.style.zIndex = '3';
        disablePage.style.opacity = '1';
    }

    element.querySelectorAll('button, [href], input, select, textarea, [tabindex]').forEach(item => {
        item.disabled = true;
    });
}
function EnableChildren(element) {
    if (element == document.querySelector('main')) {
        disablePage.style.zIndex = '-3';
        disablePage.style.opacity = '0';
    }

    element.querySelectorAll('button:not([data-disabled="true"]), [href]:not([data-disabled="true"]), input:not([data-disabled="true"]), select:not([data-disabled="true"]), textarea:not([data-disabled="true"]), [tabindex]:not([data-disabled="true"])').forEach(item => {
        item.disabled = false;
    });
}

var historyList = document.querySelector('.historyList');
var historyListItem = historyList.firstElementChild;
historyList.innerHTML = "";

function Roll(max, formula) {
    var roll = Math.ceil((1 - Math.random()) * max) + 1;
    Profile.ActiveElement.rollHistory.unshift({ "roll": roll, "max": max, "formula": formula });
    if (Profile.ActiveElement.rollHistory.length > 50) Profile.ActiveElement.rollHistory.pop();
    UpdateHistory();

    return roll;
}

function UpdateHistory() {
    historyList.innerHTML = "";
    for (const entry of Profile.ActiveElement.rollHistory) {
        historyList.innerHTML = historyList.innerHTML + historyListItem.outerHTML;
        historyList.lastElementChild.children[1].children[0].innerHTML = entry.roll + " of " + entry.max;
        historyList.lastElementChild.children[1].children[1].innerHTML = entry.formula;
    }
}

function DeleteHistoryAt(element) {
    ShowPopUp("Delete Roll?", "This will permanently delete this roll from this character! Are you sure?", "Cancel", "Delete");
    popUpPositive.onclick = function () {
        var index = Array.from(historyList.children).indexOf(element);
        Profile.ActiveElement.rollHistory.splice(index, 1);
        UpdateHistory();
        HidePopUp();
    };
}

function DeleteHistory() {
    if (Profile.ActiveElement.rollHistory.length <= 0) return;
    ShowPopUp("Delete History?", "This will permanently delete all rolls for this character, and cannot be undone! Are you sure?", "Cancel", "Delete All");
    popUpPositive.onclick = function () {
        Profile.ActiveElement.rollHistory = [];
        UpdateHistory();
        HidePopUp();
    };
}

function DropdownSelectFromString(dropdownElement, stringToSelect) {
    var selected = false;
    for (const listText of dropdownElement.querySelectorAll(".dropdownListItemLabelText")) {
        if (listText.innerHTML == stringToSelect) {
            DropdownSelect(dropdownElement, stringToSelect, listText.parentElement.parentElement.children[0]);
            selected = true;
        }
    }
    if (!selected)
        DropdownSelect(dropdownElement, stringToSelect, null);
}

function DropdownSelect(dropdownElement, stringToSelect, input) {
    if (input == null || stringToSelect == '') {
        dropdownElement.parentElement.parentElement.querySelector(".dropdownLabel").setAttribute("data-dropdown-content", "None");
        ResetDropdown(dropdownElement);
        return;
    }

    if (!input.checked) {
        for (const inputItem of dropdownElement.querySelectorAll("input[name=" + input.name + "]")) {
            if (inputItem == input)
                inputItem.checked = true;
            else
                inputItem.checked = false;
        }
    }

    if (input.name == "class") Profile.ActiveElement.class = stringToSelect;
    if (input.name == "alignment") Profile.ActiveElement.alignment = stringToSelect;
    if (input.name == "race") Profile.ActiveElement.race = stringToSelect;

    dropdownElement.parentElement.parentElement.querySelector(".dropdownLabel").setAttribute("data-dropdown-content", stringToSelect);


    if (!dropdownElement.querySelectorAll("input[name=" + input.name + "]:checked").length > 0)
        dropdownElement.parentElement.parentElement.querySelector(".dropdownLabel").setAttribute("data-dropdown-content", "None");
}

for (const container of document.querySelectorAll(".dropdownContainer")) {
    container.addEventListener("focusout", () => {
        element = container.querySelector("input[type='radio']")
        if (!document.querySelectorAll("input[name=" + element.name + "]:checked").length > 0) {
            element.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.setAttribute("data-dropdown-content", "None");
        }
    });
}

function SearchDropdown(searchbar) {
    var options = [];
    var optionChildren = searchbar.parentElement.parentElement.children[1].children;
    for (const option of optionChildren) {
        var listLabel = option.children[1];

        var text = listLabel.firstElementChild.innerHTML;
        if (text.toLowerCase().includes(searchbar.value.toLowerCase().toString())) {
            options.push(text);
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    }
}

const numInputs = document.querySelectorAll('input[type=number]')
numInputs.forEach(function (input) {
    input.addEventListener('change', function(e) {
        NormalizeInput(e.target);
    });
});

function NormalizeInput(inputElement) {
    var min = Number(inputElement.min);
    var max = Number(inputElement.max);

    if (inputElement.value == '') {
        if (inputElement.min != '')
            inputElement.value = min;
        else if (inputElement.max != '')
            inputElement.value = max;
        else
            inputElement.value = 0;
    } else if ((inputElement.value < min) && (inputElement.min != '')) {
        inputElement.value = inputElement.min;
    } else if ((inputElement.value > max) && (inputElement.max != '')) {
        inputElement.value = inputElement.max;
    }

    inputElement.value = Number(inputElement.value);
}

function ResetDropdown(dropdownElement) {
    var sampleInputName = dropdownElement.firstElementChild.firstElementChild.name;

    if (sampleInputName == "class")
        Profile.ActiveElement.class = '';
    if (sampleInputName == "alignment")
        Profile.ActiveElement.alignment = '';
    if (sampleInputName == "race")
        Profile.ActiveElement.race = '';

    for (const item of dropdownElement.children) {
        item.firstElementChild.checked = false;
    }
}

var sheets = Array.from(document.querySelector('.sheetContentArea').children);
function SwitchSheet(indexToSelect) {
    for (const sheet of sheets) {
        var index = sheets.indexOf(sheet);

        if (index == indexToSelect) sheet.classList.add('active');
        else sheet.classList.remove('active');
    }
}

function UpdateAbility(inputElement, modifier) {
    var textElement = inputElement.parentElement.parentElement.firstElementChild;

    NormalizeInput(inputElement);
    Profile.ActiveElement.abilityScores[modifier] = Number(inputElement.value);
    textElement.innerHTML = ScoreToModifier(inputElement.value);

    UpdateSavingThrowProficiency(savingThrowProficiencies[modifier], modifier, savingThrowProficiencies[modifier].getAttribute("data-modifier-proficiency"));
}

function FormatModifier(input) {
    var output = Number(input);

    if (output >= 0)
        output = '+' + output;

    return output;
}

function NextModifierProficiency(buttonElement, modifier, modifierType) {
    var targetValue = Number(buttonElement.getAttribute("data-modifier-proficiency")) + 1;

    if (targetValue >= 4)
        targetValue = 0;

    if (modifierType == 'savingThrow')
        UpdateSavingThrowProficiency(buttonElement, modifier, targetValue);
}

function UpdateSavingThrowProficiency(buttonElement, modifier, targetValue) {
    var targetOutput = buttonElement.parentElement.querySelector('.modifierOutput');

    Profile.ActiveElement.savingThrowMultipliers[modifier] = PROFICIENCY_INDEX_TO_MULTIPLIER[targetValue];
    buttonElement.setAttribute("data-modifier-proficiency", targetValue);
    targetOutput.innerHTML = FormatModifier(Math.floor(Number(Number(ScoreToModifier(Number(Profile.ActiveElement.abilityScores[modifier]))) + (Profile.ActiveElement.proficiencyBonus * Profile.ActiveElement.savingThrowMultipliers[modifier]))));
}

const ScoreToModifier = (score) => FormatModifier(Math.floor((Number(score) - 10) * 0.5));
const ABILITY_NAMES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const PROFICIENCY_INDEX_TO_MULTIPLIER = {0:0, 1:0.5, 2:1, 3:2};
const PROFICIENCY_MULTIPLIER_TO_INDEX = {0:0, 0.5:1, 1:2, 2:3};

/* 
TODO
- relationship between xp and level
*/