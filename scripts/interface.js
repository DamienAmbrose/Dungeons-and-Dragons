class Profile {
    static activeIndex = 0;
    static list = [];

    static get ActiveProfile() {
        return this.list[this.activeIndex];
    }

    static set ActiveProfile(profile) {
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
    alignment = "Unaligned";
    xp = 0;

    proficiencyBonus = 2;
    inspiration = 0;


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
    skillMultipliers = {
        "acrobatics": 0,
        "animals": 0,
        "arcana": 0,
        "athletics": 0,
        "deception": 0,
        "history": 0,
        "insight": 0,
        "intimidation": 0,
        "investigation": 0,
        "medicine": 0,
        "nature": 0,
        "perception": 0,
        "performance": 0,
        "persuasion": 0,
        "religion": 0,
        "soh": 0,
        "stealth": 0,
        "survival": 0
    };
    coins = {
        "copper": 0,
        "silver": 0,
        "electrum": 0,
        "gold": 0,
        "platinum": 0
    };
    equipment = [];
    proficiencies = ['Common'];
}

Profile.list.push(new Profile("Dungeon Master"));

//#region Input Validation
const numInputs = document.querySelectorAll('input[type=number]')
numInputs.forEach(function (input) {
    input.addEventListener('change', function (e) {
        NormalizeInput(e.target);
    });
});
const modifierInputs = document.querySelectorAll('input.modifier-input')
modifierInputs.forEach(function (input) {
    input.addEventListener('change', function (e) {
        NormalizeModifier(e.target);
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
function NormalizeModifier(inputElement) {
    var min = Number(inputElement.min);
    var max = Number(inputElement.max);
    var value = Number(inputElement.value.replace(/[^-+.\d]/g, ""));
    
    if (!Number.isInteger(value)) {
        if (inputElement.min != '')
            value = min;
        else if (inputElement.max != '')
            value = max;
        else
            value = 0;
    } else if ((value < min) && (inputElement.min != '')) {
        value = inputElement.min;
    } else if ((value > max) && (inputElement.max != '')) {
        value = inputElement.max;
    }

    inputElement.value = FormatModifier(value);
}
//#endregion

//#region  Audio
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
//#endregion

//#region Keyboard Shortcuts
document.addEventListener("keydown", function (event) {
    if (event.shiftKey && (event.key === "T" || event.shiftKey && event.key === "t")) {
        NewTab();
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && (event.key === "W" || event.shiftKey && event.key === "w")) {
        RequestDeleteTab(Profile.ActiveProfile.Tab);
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        Escape();
    }
});

function Escape() {
    HidePopUp();
    CloseSettings();
    CloseSheet();
}
//#endregion

//#region Loader
let loader = document.querySelector('loader');
let loaderMask = document.querySelector('loader__mask');
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
//#endregion

//#region Tabs
var tabContainer = document.querySelector('#tabs');
var tabCounter = document.querySelector('#tab-counter');
var tabUI = tabContainer.firstElementChild.outerHTML;
var tabRenamer = document.querySelector('#character-name');
var sheetRenamer = document.querySelector('#character-type__name-info__name-input');

function NewTab() {
    if (Profile.list.length >= 99) return;

    Profile.list.push(new Profile("New Character (" + Profile.Count + ")"));
    tabContainer.innerHTML += tabUI;

    UpdateSheets();
    SelectActiveTab();

    Profile.TabList[(Profile.Count - 1)].firstElementChild.focus();
    SelectTab(Profile.TabList[Profile.Count - 1])
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
    Profile.ActiveProfile.Tab.classList.add('active');

    tabCounter.innerHTML = Profile.Count;
}

function SelectTab(tab) {
    Profile.activeIndex = Profile.TabList.indexOf(tab);
    UpdateHistory();
    SelectActiveTab();
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
//#endregion

//#region Upload & Download
function RequestUploadActiveProfile() {
    ShowPopUp('Overwrite Character?', 'This will permanently replace "' + Profile.ActiveProfile.name + '"! Make sure to backup to JSON first', 'Cancel', 'Overwrite');
    popUpPositive.onclick = function () {
        UploadActiveProfile();
    };
}

function DownloadActiveProfile() {
    Download(Profile.ActiveProfile.name + " Profile Backup (" + new Date().getTime() + ")",
        JSON.stringify(Profile.ActiveProfile));
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
            Profile.ActiveProfile.name = parseResult.name;
            Profile.ActiveProfile.rollHistory = parseResult.rollHistory;
            Profile.ActiveProfile.backstory = parseResult.backstory;
            Profile.ActiveProfile.class = parseResult.class;
            Profile.ActiveProfile.classLevel = parseResult.classLevel;
            Profile.ActiveProfile.background = parseResult.background;
            Profile.ActiveProfile.playerName = parseResult.playerName;
            Profile.ActiveProfile.race = parseResult.race;
            Profile.ActiveProfile.alignment = parseResult.alignment;
            Profile.ActiveProfile.xp = parseResult.xp;
            Profile.ActiveProfile.savingThrowMultipliers = parseResult.savingThrowMultipliers;
            Profile.ActiveProfile.skillMultipliers = parseResult.skillMultipliers;
            Profile.ActiveProfile.abilityScores = parseResult.abilityScores;
            Profile.ActiveProfile.coins = parseResult.coins;
            Profile.ActiveProfile.equipment = parseResult.equipment;
            Profile.ActiveProfile.proficiencies = parseResult.proficiencies;

            UpdateHistory();
        } catch {
            ShowPopUp('Upload Error', 'The file you uploaded was either not a compatible JSON file or was corrupted', 'Close', 'Okay');
        }

        UpdateSheets();
    };

    if (file != null) reader.readAsText(file);
}
//#endregion

//#region Popups
var popUp = document.querySelector('pop-up');
var popUpTitle = popUp.querySelector('pop-up__title');
var popUpContent = popUp.querySelector('pop-up__content');
var popUpPositive = popUp.querySelector('#pop-up__button-true');
var popUpNegative = popUp.querySelector('#pop-up__button-false');

let popVolume = 0.2;
function ShowPopUp(title, content, negative, positive) {
    const popSFX = new Audio('audio/sfx/Pop.wav');
    popSFX.volume = popVolume;
    popSFX.play();

    DisableChildren(main);
    EnableChildren(popUp);

    popUp.classList.add('active');    
    popUpPositive.focus();

    popUpTitle.innerHTML = title;
    popUpContent.innerHTML = content;

    popUpNegative.innerHTML = negative;
    popUpPositive.innerHTML = positive;
}

function HidePopUp() {
    popUp.classList.remove('active');

    popUpPositive.setAttribute('onclick', 'HidePopUp()');
    popUpNegative.setAttribute('onclick', 'HidePopUp()');

    EnableChildren(main);
    DisableChildren(popUp);
}
//#endregion

//#region Settings UI
var settingsMenu = document.querySelector('#settings-panel');
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
//#endregion

//#region Sheets UI
var sheetMenu = document.querySelector('#sheets-panel');
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

var sheets = Array.from(document.querySelector('#sheets-panel panel-content').children);
function SwitchSheet(indexToSelect) {
    for (const sheet of sheets) {
        var index = sheets.indexOf(sheet);

        if (index == indexToSelect) sheet.classList.add('active');
        else sheet.classList.remove('active');
    }
}

let equipmentNotesInput = document.getElementById("showNotes");
function ToggleEquipmentNotes(state) {
    for (const textarea of equipmentList.querySelectorAll('textarea'))
        textarea.disabled = !state;
}
//#endregion

//#region Accessibility
var main = document.querySelector('main');
var disablePage = document.querySelector('disable-page');

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
//#endregion

//#region Roll History
var historyList = document.querySelector('#history__list');
var historyListItem = historyList.firstElementChild;
historyList.innerHTML = "";

function Roll(max, formula) {
    var roll = Math.ceil((1 - Math.random()) * max) + 1;
    Profile.ActiveProfile.rollHistory.unshift({ "roll": roll, "max": max, "formula": formula });
    if (Profile.ActiveProfile.rollHistory.length > 50) Profile.ActiveProfile.rollHistory.pop();
    UpdateHistory();

    return roll;
}

function UpdateHistory() {
    historyList.innerHTML = "";
    for (const entry of Profile.ActiveProfile.rollHistory) {
        historyList.innerHTML = historyList.innerHTML + historyListItem.outerHTML;
        historyList.lastElementChild.children[1].children[0].innerHTML = entry.roll + " of " + entry.max;
        historyList.lastElementChild.children[1].children[1].innerHTML = entry.formula;
    }
}

function DeleteHistoryAt(element) {
    ShowPopUp("Delete Roll?", "This will permanently delete this roll from this character! Are you sure?", "Cancel", "Delete");
    popUpPositive.onclick = function () {
        var index = Array.from(historyList.children).indexOf(element);
        Profile.ActiveProfile.rollHistory.splice(index, 1);
        UpdateHistory();
        HidePopUp();
    };
}

function DeleteHistory() {
    if (Profile.ActiveProfile.rollHistory.length <= 0) return;
    ShowPopUp("Delete History?", "This will permanently delete all rolls for this character, and cannot be undone! Are you sure?", "Cancel", "Delete All");
    popUpPositive.onclick = function () {
        Profile.ActiveProfile.rollHistory = [];
        UpdateHistory();
        HidePopUp();
    };
}
//#endregion

//#region Dropdowns
function DropdownSelectFromString(dropdownElement, stringToSelect) {
    var selected = false;
    for (const listText of dropdownElement.querySelectorAll(".dropdown-list__item__label__text")) {
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
        dropdownElement.parentElement.parentElement.querySelector("dropdown-label__text").setAttribute("data-dropdown-content", "None");
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

    if (input.name == "class") Profile.ActiveProfile.class = stringToSelect;
    if (input.name == "alignment") Profile.ActiveProfile.alignment = stringToSelect;
    if (input.name == "race") Profile.ActiveProfile.race = stringToSelect;

    dropdownElement.parentElement.parentElement.querySelector("dropdown-label__text").setAttribute("data-dropdown-content", stringToSelect);


    if (!dropdownElement.querySelectorAll("input[name=" + input.name + "]:checked").length > 0)
        dropdownElement.parentElement.parentElement.querySelector("dropdown-label__text").setAttribute("data-dropdown-content", "None");
}

for (const container of document.querySelectorAll("dropdown")) {
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

function ResetDropdown(dropdownElement) {
    var sampleInputName = dropdownElement.firstElementChild.firstElementChild.name;

    if (sampleInputName == "class")
        Profile.ActiveProfile.class = '';
    if (sampleInputName == "alignment")
        Profile.ActiveProfile.alignment = '';
    if (sampleInputName == "race")
        Profile.ActiveProfile.race = '';

    for (const item of dropdownElement.children) {
        item.firstElementChild.checked = false;
    }
}
//#endregion

//#region Updates
let backstoryField = document.getElementById("character-type__name-info__backstory-input");
let classDropdown = document.getElementById("classDropdown");
let classLevelField = document.getElementById("levelField");
let playerNameField = document.getElementById("playerNameField");
let raceDropdown = document.getElementById("raceDropdown");
let backgroundField = document.getElementById("backgroundField");
let alignmentDropdown = document.getElementById("alignmentDropdown");
let xpField = document.getElementById("xpField");

let proficiencyBonusInput = document.getElementById("proficiencyBonus");

let equipmentTitle = document.getElementById("equipmentTitle");
let equipmentList = document.getElementById("equipmentList");
let equipmentBox = equipmentList.firstElementChild;

let proficienciesList = document.getElementById("proficiencyList");
let proficiencyBox = proficienciesList.firstElementChild;

equipmentList.innerHTML = "";

let savingThrowProficiencies = {
    'str': document.querySelector("#str-savingThrowBox"),
    'dex': document.querySelector("#dex-savingThrowBox"),
    'con': document.querySelector("#con-savingThrowBox"),
    'int': document.querySelector("#int-savingThrowBox"),
    'wis': document.querySelector("#wis-savingThrowBox"),
    'cha': document.querySelector("#cha-savingThrowBox")
};

let skillProficiencies = {
    "acrobatics": document.querySelector("#acrobatics-skillBox"),
    "animals": document.querySelector("#animals-skillBox"),
    "arcana": document.querySelector("#arcana-skillBox"),
    "athletics": document.querySelector("#athletics-skillBox"),
    "deception": document.querySelector("#deception-skillBox"),
    "history": document.querySelector("#history-skillBox"),
    "insight": document.querySelector("#insight-skillBox"),
    "intimidation": document.querySelector("#intimidation-skillBox"),
    "investigation": document.querySelector("#investigation-skillBox"),
    "medicine": document.querySelector("#medicine-skillBox"),
    "nature": document.querySelector("#nature-skillBox"),
    "perception": document.querySelector("#perception-skillBox"),
    "performance": document.querySelector("#performance-skillBox"),
    "persuasion": document.querySelector("#persuasion-skillBox"),
    "religion": document.querySelector("#religion-skillBox"),
    "soh": document.querySelector("#soh-skillBox"),
    "stealth": document.querySelector("#stealth-skillBox"),
    "survival": document.querySelector("#survival-skillBox")
}

let abilityScoreInputs = {
    'str': document.getElementById("strScore"),
    'dex': document.getElementById("dexScore"),
    'con': document.getElementById("conScore"),
    'int': document.getElementById("intScore"),
    'wis': document.getElementById("wisScore"),
    'cha': document.getElementById("chaScore")
}

let coinInputs = {
    "copper": document.getElementById("copper"),
    "silver": document.getElementById("silver"),
    "electrum": document.getElementById("electrum"),
    "gold": document.getElementById("gold"),
    "platinum": document.getElementById("platinum")
}

function UpdateSheets() {
    for (const tab of Profile.TabList) {
        const index = Profile.TabList.indexOf(tab);
        tab.firstElementChild.value = Profile.list[index].name;
    }

    tabRenamer.value = Profile.ActiveProfile.name;
    sheetRenamer.value = Profile.ActiveProfile.name;

    backstoryField.value = Profile.ActiveProfile.backstory;
    classLevelField.value = Profile.ActiveProfile.classLevel;
    playerNameField.value = Profile.ActiveProfile.playerName;
    backgroundField.value = Profile.ActiveProfile.background;
    xpField.value = Profile.ActiveProfile.xp;

    DropdownSelectFromString(classDropdown, Profile.ActiveProfile.class);
    DropdownSelectFromString(raceDropdown, Profile.ActiveProfile.race);
    DropdownSelectFromString(alignmentDropdown, Profile.ActiveProfile.alignment);

    for (const coinType of Array.from(Object.keys(coinInputs))) {
        coinInputs[coinType].value = Profile.ActiveProfile.coins[coinType];
    }

    UpdateAllModifiers();
    UpdateAllSkills();
    UpdateAllEquipment();
    UpdateAllProficiencies();
}

function UpdateAbility(inputElement, modifier) {
    var textElement = inputElement.parentElement.parentElement.firstElementChild;

    NormalizeInput(inputElement);
    Profile.ActiveProfile.abilityScores[modifier] = Number(inputElement.value);
    textElement.innerHTML = ScoreToModifier(inputElement.value);

    UpdateAllSkills();
    UpdateSavingThrowProficiency(savingThrowProficiencies[modifier], modifier, savingThrowProficiencies[modifier].getAttribute("data-modifier-proficiency"));
}

function NextModifierProficiency(buttonElement, modifier, modifierType) {
    var targetValue = Number(buttonElement.getAttribute("data-modifier-proficiency")) + 1;

    if (targetValue >= 4)
        targetValue = 0;

    if (modifierType == 'savingThrow')
        UpdateSavingThrowProficiency(buttonElement, modifier, targetValue);
    else if (modifierType == 'skill')
        UpdateSkillProficiency(buttonElement, modifier, targetValue);
}

function UpdateSavingThrowProficiency(buttonElement, modifier, targetValue) {
    var targetOutput = buttonElement.querySelector('modifier-proficiency__output');

    Profile.ActiveProfile.savingThrowMultipliers[modifier] = PROFICIENCY_INDEX_TO_MULTIPLIER[targetValue];
    buttonElement.setAttribute("data-modifier-proficiency", targetValue);
    targetOutput.innerHTML = FormatModifier(Math.floor(Number(Number(ScoreToModifier(Number(Profile.ActiveProfile.abilityScores[modifier]))) + (Profile.ActiveProfile.proficiencyBonus * Profile.ActiveProfile.savingThrowMultipliers[modifier]))));
}

function UpdateSkillProficiency(buttonElement, modifier, targetValue) {
    var targetOutput = buttonElement.querySelector('modifier-proficiency__output');

    Profile.ActiveProfile.skillMultipliers[modifier] = PROFICIENCY_INDEX_TO_MULTIPLIER[targetValue];
    buttonElement.setAttribute("data-modifier-proficiency", targetValue);
    targetOutput.innerHTML = FormatModifier(Math.floor(Number(Number(ScoreToModifier(Number(Profile.ActiveProfile.abilityScores[SKILL_TO_ABILITY[modifier]]))) + (Profile.ActiveProfile.proficiencyBonus * Profile.ActiveProfile.skillMultipliers[modifier]))));
}

function UpdateAllSkills() {
    for (const skillName of Array.from(Object.keys(SKILL_TO_ABILITY)))
        UpdateSkillProficiency(skillProficiencies[skillName], skillName, PROFICIENCY_MULTIPLIER_TO_INDEX[Profile.ActiveProfile.skillMultipliers[skillName]]);
}

function UpdateCoin(inputElement) {
    Profile.ActiveProfile.coins[inputElement.id] = inputElement.value;
}

function AddEquipment() {
    Profile.ActiveProfile.equipment.push({ "count": 1, "name": '', "notes": ''});
    UpdateAllEquipment();
}

function UpdateEquipment(listElement) {
    var countInput = listElement.querySelector('input[type="number"]');
    var nameInput = listElement.querySelector('input[type="text"]');
    var notesInput = listElement.querySelector('textarea');
    var index = Array.from(equipmentList.children).indexOf(listElement);

    if (countInput.value <= 0)
        Profile.ActiveProfile.equipment.splice(index, 1);
    else
        Profile.ActiveProfile.equipment[index] = { "count": countInput.value, "name": nameInput.value, "notes": notesInput.value };

    UpdateAllEquipment();
}

function UpdateAllEquipment() {
    equipmentList.innerHTML = '';
    for (let index = 0; index < Profile.ActiveProfile.equipment.length; index++)
        equipmentList.innerHTML = equipmentList.innerHTML + equipmentBox.outerHTML;


    for (const listItem of equipmentList.children) {
        var entry = Profile.ActiveProfile.equipment[Array.from(equipmentList.children).indexOf(listItem)];

        listItem.querySelector('input[type="number"]').value = entry.count;
        listItem.querySelector('input[type="text"]').value = entry.name;
        listItem.querySelector('textarea').innerHTML = entry.notes;
    }

    equipmentTitle.setAttribute("data-after-content", '(' + Profile.ActiveProfile.equipment.length + ')');

    ToggleEquipmentNotes(equipmentNotesInput.checked);
    
    if (!equipmentTitle.parentElement.querySelector('button').disabled)
        EnableChildren(equipmentList);
}

function UpdateAllModifiers() {
    for (const modifierName of ABILITY_NAMES) {
        abilityScoreInputs[modifierName].value = Profile.ActiveProfile.abilityScores[modifierName];

        UpdateSavingThrowProficiency(savingThrowProficiencies[modifierName], modifierName, PROFICIENCY_MULTIPLIER_TO_INDEX[Profile.ActiveProfile.savingThrowMultipliers[modifierName]]);
        UpdateAbility(abilityScoreInputs[modifierName], modifierName)
    }
}

function AddProficiency() {
    Profile.ActiveProfile.proficiencies.push('');
    UpdateAllProficiencies();
}

function RemoveProficiency(listElement) {
    Profile.ActiveProfile.proficiencies.splice(Array.from(proficienciesList.children).indexOf(listElement), 1);
    UpdateAllProficiencies();
}

function UpdateProficiency(listElement) {
    var nameInput = listElement.querySelector('input[type="text"]');
    var index = Array.from(proficienciesList.children).indexOf(listElement);
    Profile.ActiveProfile.proficiencies[index] = nameInput.value;

    UpdateAllProficiencies();
}

function UpdateAllProficiencies() {
    proficienciesList.innerHTML = '';
    for (let index = 0; index < Profile.ActiveProfile.proficiencies.length; index++)
        proficienciesList.innerHTML = proficienciesList.innerHTML + proficiencyBox.outerHTML;


    for (const listItem of proficienciesList.children) {
        var entry = Profile.ActiveProfile.proficiencies[Array.from(proficienciesList.children).indexOf(listItem)];

        listItem.querySelector('input[type="text"]').value = entry;
    }

    ToggleEquipmentNotes(equipmentNotesInput.checked);
    
    if (!equipmentTitle.parentElement.querySelector('button').disabled)
        EnableChildren(equipmentList);
}

function UpdateProficiencyBonus() {
    NormalizeModifier(proficiencyBonusInput);
    Profile.ActiveProfile.proficiencyBonus = Number(proficiencyBonusInput.value);
    UpdateAllModifiers();
}
//#endregion

//#region Utilities
function FormatModifier(input) {
    var output = Number(input);

    if (output >= 0)
        output = '+' + output;

    return output;
}
const ScoreToModifier = (score) => FormatModifier(Math.floor((Number(score) - 10) * 0.5));
const ABILITY_NAMES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const PROFICIENCY_INDEX_TO_MULTIPLIER = { 0: 0, 1: 0.5, 2: 1, 3: 2 };
const PROFICIENCY_MULTIPLIER_TO_INDEX = { 0: 0, 0.5: 1, 1: 2, 2: 3 };
const SKILL_TO_ABILITY = {
    "acrobatics": "dex",
    "animals": "wis",
    "arcana": "int",
    "athletics": "str",
    "deception": "cha",
    "history": "int",
    "insight": "wis",
    "intimidation": "cha",
    "investigation": "int",
    "medicine": "wis",
    "nature": "int",
    "perception": "wis",
    "performance": "cha",
    "persuasion": "cha",
    "religion": "int",
    "soh": "dex",
    "stealth": "dex",
    "survival": "wis"
}
const NotImplemented = () => ShowPopUp('Not Implemented', 'This feature is still work in progress. Try messing around with something else', 'Close', 'Okay');
//#endregion

/* 
TODO
- relationship between xp and level
- multiclass
*/