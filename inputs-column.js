
/* *********************************************************************************** */
// Title of the left pane
const leftTitle = document.getElementById('left-title');
// Objects of all the forms
const addNewExperimentForm = document.getElementById('add-new-experiment-form');
const currentExperimentForm = document.getElementById('current-experiment-form');
const addNewSubjectForm = document.getElementById('add-new-subject-form');
const viewAllSubjects = document.getElementById('view-all-subjects');
const behaviourParametersForm = document.getElementById('behaviour-parameters-form');
const scoringForm = document.getElementById('scoring-form');
const analysisForm = document.getElementById('analysis-form');

// Utilities
const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
const sqrDif = (arr, avg) => arr.map(function (value) {
    let diff = value - avg;
    let sqrDiff = diff * diff;
    return sqrDiff;
});
const arrSTD = arr => Math.sqrt(arrAvg(sqrDif(arr, arrAvg(arr))));

// Tracker for last scored behaviour
let lastScoredBehaviour;
let lastScoredTime;
let activeSubject;
let scoringTabActive = false;

function clearTitleAndHideForms() {
    let forms = [addNewExperimentForm, currentExperimentForm, addNewSubjectForm, viewAllSubjects,
        behaviourParametersForm, scoringForm, analysisForm];

    function hideForm(form) {
        form.style.display = 'none';
    };

    leftTitle.style.display = 'none';
    forms.forEach(hideForm);

    scoringTabActive = false;
};

const addNewExperimentOption = document.getElementById('add-new-experiment-option');
addNewExperimentOption.addEventListener(
    'click',
    function showNewExperimentForm() {
        clearTitleAndHideForms();
        leftTitle.innerHTML = 'Create New Experiment';
        leftTitle.style.display = '';
        addNewExperimentForm.style.display = '';
    }
);

const openExistingExperimentOption = document.getElementById('open-existing-experiment-option');
openExistingExperimentOption.addEventListener(
    'click',
    function openExperiment() {
        let input = document.createElement('input');
        input.type = 'file';

        input.onchange = function () {
            let file = input.files[0];
            let fr = new FileReader();
            fr.onload = parseExperimentFile;
            fr.readAsText(file);
        }

        input.click();
    }
)

function parseExperimentFile(e) {
    let lines = e.target.result;
    let result = JSON.parse(lines);

    current_experiment = new Experiment(result.experiment_data, result.subjects_data, result.behaviour_parameters);

    // Populate Experiment Metadata
    populateExperimentMetadata(current_experiment.experiment_data);
    // Populate Existing Subjects
    populateExistingSubjects(current_experiment.subjects_data);
    // Populate with Scoring Data
    populateBehaviourParameters(current_experiment.behaviour_parameters);
}

function populateExperimentMetadata(experiment_data) {
    // Name
    const currentExperimenterNameField = document.getElementById('current-experimenter-name-field');
    currentExperimenterNameField.value = experiment_data.name;
    // Date
    const currentExperimentDateField = document.getElementById('current-experiment-date-field');
    currentExperimentDateField.value = experiment_data.date;
}

function populateExistingSubjects(subjects_data) {
    document.querySelector('#view-all-subjects-table-body').innerHTML = '';
    subjects_data.forEach(subject => addNewSubject('', subject));
}

function populateBehaviourParameters(behaviour_parameters) {
    // Add the behaviour parameter rows
    behaviour_parameters.forEach(bp => addBehaviourParameterRow('', bp.key, bp.behaviour));
    // Register them
    registerAllBehaviourParameters();
}

const currentExperimentOption = document.getElementById('current-experiment-option');
currentExperimentOption.addEventListener(
    'click',
    function showNewExperimentForm() {
        clearTitleAndHideForms();
        leftTitle.innerHTML = 'Modify Current Experiment';
        leftTitle.style.display = '';
        currentExperimentForm.style.display = '';
    }
);

const addNewSubjectOption = document.getElementById('add-new-subject-option');
addNewSubjectOption.addEventListener(
    'click',
    function showSubjectsForm() {
        clearTitleAndHideForms();
        leftTitle.innerHTML = 'Add New Subject';
        leftTitle.style.display = '';
        addNewSubjectForm.style.display = '';
    }
);

const viewAllSubjectsOption = document.getElementById('view-all-subjects-option');
viewAllSubjectsOption.addEventListener(
    'click',
    function showSubjectsForm() {
        clearTitleAndHideForms();
        leftTitle.innerHTML = 'All Subjects';
        leftTitle.style.display = '';
        viewAllSubjects.style.display = '';
    }
);

const behaviourParametersOption = document.getElementById('behaviour-parameters-option');
behaviourParametersOption.addEventListener(
    'click',
    function showBehaviorParametersForm() {
        clearTitleAndHideForms();
        leftTitle.innerHTML = 'Behaviour Parameters';
        leftTitle.style.display = '';
        behaviourParametersForm.style.display = '';
    }
);

const scoringOption = document.getElementById('scoring-option');
scoringOption.addEventListener(
    'click',
    function showScoringForm() {
        clearTitleAndHideForms();
        leftTitle.innerHTML = 'Scoring';
        leftTitle.style.display = '';
        scoringForm.style.display = '';
        scoringTabActive = true;
    }
);

const analysisOption = document.getElementById('analysis-option');
analysisOption.addEventListener(
    'click',
    function showAnalysisForm() {
        clearTitleAndHideForms();
        leftTitle.innerHTML = 'Analysis';
        leftTitle.style.display = '';
        analysisForm.style.display = '';
    }
);

const addNewSubjectButton = document.getElementById('add-new-subject-button');
addNewSubjectButton.addEventListener(
    'click',
    addNewSubject);

function createTableCells() {

    // These are the fields that we can programmatically access easily (i.e. in a loop)
    let fields = [
        '#subject-id-field',
        '#genotype-field',
        '#sex-value-dropdown',
        '#group-field',
        '#treatment-field',
        '#comment-field',];

    let tableCells = [];
    function createTableCellForField(fieldID) {
        // create table cell
        let tableCell = document.createElement('td');
        // create data-label
        let temp = fieldID.split('-');
        let dataLabel = temp.slice(1, temp.length - 1).join('-');
        // set data-label attribute
        tableCell.setAttribute('data-label', dataLabel);
        // done
        tableCells.push(tableCell);
    }

    // Create the cells (they're appended to the tableCells array)
    fields.forEach(createTableCellForField);

    // Finish
    return tableCells;
}

function createSubjectRow(source) {
    // Create the table cells
    let tableCells = createTableCells();
    // Create the table row
    let tableRow = document.createElement('tr');

    let subject_data = 1;

    if (source === 'form') {
        subject_data = getSubjectDataFromForm();
    }
    else {
        subject_data = [];

        Object.values(source).forEach(value => subject_data.push(value));
    }

    // Add all cells into the row
    function addToTableRow(tableCell) {
        tableRow.insertAdjacentHTML('beforeend', tableCell.outerHTML);
    };

    for (let i = 0; i < 6; i++) {
        tableCell = tableCells[i].innerText = subject_data[i];
    }

    tableCells.forEach(addToTableRow);

    return tableRow;
}

/** 
 * This Function has a side effect of clearing the data from the form after collection
 * This Function has a side effect of adding the subject to the current_experiment data structure
 */
function getSubjectDataFromForm() {
    // These are the fields that we can programmatically access easily (i.e. in a loop)
    let fields = [
        '#subject-id-field',
        '#genotype-field',
        '#group-field',
        '#treatment-field',
        '#comment-field',];

    let fieldValues = [];
    function getValueFromField(fieldID) {
        // Get field element
        let field = document.querySelector(fieldID);
        // Get data from field
        let fieldValue = field.value;
        // Clear original field
        field.value = '';
        // done
        fieldValues.push(fieldValue);
    }

    // Loop through
    fields.forEach(getValueFromField);

    // Do dropdown
    let sexDropdown = $('#sex-value-dropdown');
    // Get data from form
    let sexValue = sexDropdown.dropdown('get value');

    // Splice it into the table Cells
    fieldValues.splice(2, 0, sexValue);

    // Add the generated subject to the current_experiment
    let subject = new Subject();
    subject.setFields(fieldValues);
    current_experiment.addSubject(subject);

    // Finish
    return fieldValues;
}

function addNewSubject(temp, target_source = 'form') {
    const viewAllSubjectsBody = document.querySelector('#view-all-subjects-table-body');

    let tableRow = createSubjectRow(target_source);

    // Add the table row to the table
    viewAllSubjectsBody.insertAdjacentHTML('beforeend', tableRow.outerHTML);

    // Populate the search bar searcher thing
    populateSubjectSearch();
}

const addBehaviourParameterButton = document.getElementById('add-behaviour-parameter-button');
let bpRowCounter = 0;
let behaviourParameters = [];
addBehaviourParameterButton.addEventListener(
    'click',
    addBehaviourParameterRow
);

function addBehaviourParameterRow(e, keyValue, behaviourValue) {
    // Find the parameter list
    let behaviourParameterList = document.querySelector('#behaviour-parameter-list');
    // Generate a unique id for the behaviour parameter
    let index = { text: bpRowCounter };
    // Create the row where the behaviour parameter can be entered
    behaviourParameterList.insertAdjacentHTML('beforeend',
        `
          <div id='behaviour-parameter-row-${index.text}'>
            <div class='inline fields'>
              <div class='four wide field'>
                <input type='text' id='behaviour-parameter-row-${index.text}-key' placeholder='Key'>
              </div>
              <div class='five wide field'>
                <input type='text' id='behaviour-parameter-row-${index.text}-behaviour' placeholder='Behaviour'>
              </div>
              <i class='close icon' id='behaviour-parameter-row-close-icon-${index.text}'></i>
          </div>
          `
    );
    // Create a way to delete this behaviour parameter, if necessary.
    let id = 'behaviour-parameter-row-close-icon-'.concat(bpRowCounter);
    const behaviourParameterRowCloseIcon = document.querySelector('#behaviour-parameter-row-close-icon-'.concat(bpRowCounter));
    behaviourParameterRowCloseIcon.addEventListener(
        'click',
        function removeBehaviourParameterRow() {
            // Get the row
            const behaviourParameterRow = behaviourParameterRowCloseIcon.parentElement.parentElement;
            // Get the "unique" id
            const rowid = behaviourParameterRow.id;
            rowid = rowid.split('-');
            rowid = rowid[rowid.length - 1];
            // Remove it from the collection
            behaviourParameters.splice(rowid, 1);
            // Remove it from the DOM
            behaviourParameterRow.remove();
        }
    );

    if (keyValue === undefined) {
        keyValue = "";
    }
    else {
        document.getElementById(`behaviour-parameter-row-${index.text}-key`).value = keyValue;
    }
    if (behaviourValue === undefined) {
        behaviourValue = "";
    }
    else {
        document.getElementById(`behaviour-parameter-row-${index.text}-behaviour`).value = behaviourValue;
    }

    // Using the unique ID, create an entry in the behaviour parameters collection
    let behaviourParameter = new BehaviourParameter(keyValue, behaviourValue, `behaviour-parameter-row-${index.text}`);
    behaviourParameters[bpRowCounter] = behaviourParameter;

    // Increment counter
    bpRowCounter++;
}

const registerBehaviourParametersButton = document.getElementById('register-behaviour-parameters-button');
registerBehaviourParametersButton.addEventListener(
    'click',
    registerAllBehaviourParameters
);

function registerAllBehaviourParameters() {

    let keydownHandlers = {};

    /** This private function is used for registering individual behaviour parameters */
    function registerBehaviourParameter(behaviourParameter) {

        // Get the key and behaviour from the specific behaviourParameterRow
        let behaviourParameterKeyField = document.getElementById(behaviourParameter.id + "-key");
        let key = behaviourParameterKeyField.value;
        let behaviourParameterBehaviourField = document.getElementById(behaviourParameter.id + "-behaviour");
        let behaviour = behaviourParameterBehaviourField.value;

        // Check if the key field value is reasonable (i.e. non-empty and exactly one character)
        if (key.length === 1) {

            /* Add to scoring session table body */
            // Get the reference to the table body
            const scoringSessionTableBody = document.getElementById('scoring-session-table-body');
            let tableRow = document.createElement('tr');
            let theads = ['key', 'behaviour', 'frequency', 'duration', 'mean-duration', 'sd'];
            let cells = [];
            function createCell(datalabel) {
                let cell = document.createElement('td');
                cell.setAttribute('data-label', datalabel);
                cell.id = key + "-" + datalabel;
                cells.push(cell);
            }
            // Create the cells with their data labels
            theads.forEach(createCell);
            // Manually set the data for the first two cells
            // the other cells will be populated dynamically 
            cells[0].innerText = key;
            cells[1].innerText = behaviour;
            // Add all cells into the row
            function addToTableRow(tableCell) {
                tableRow.insertAdjacentHTML('beforeend', tableCell.outerHTML);
            };
            cells.forEach(addToTableRow);
            scoringSessionTableBody.insertAdjacentHTML('beforeend', tableRow.outerHTML);

            /* Begin registration */
            // Register in datastructure
            current_experiment.behaviour_parameters.push(behaviourParameter);
            // Begin Register event handlers

            // Create event handler
            let keydownHandler = function () {
                // Only do something if the scoring tab is active
                if (scoringTabActive === true) {
                    const countdownBox = document.getElementById('trackerInputBox');
                    let scoredTime = countdownBox.value;
                    // Scoring occurs on the SECOND keystroke.
                    // That is, the first keystroke indicates that the behaviour has started
                    // The second keystroke means the behaviour has ended and a new behaviour has started
                    if (lastScoredBehaviour !== undefined) {
                        // Add the behaviour parameter to the activeSubject if it doesn't have it.
                        if (activeSubject.scoring_data.hasOwnProperty(key) === false) {
                            activeSubject.scoring_data[key] = lastScoredBehaviour;
                        }

                        // Get the key from the last scored behaviour
                        const lastKey = lastScoredBehaviour.key;

                        // Update the statistics
                        // Update Frequency
                        activeSubject.scoring_data[lastKey].frequency++;
                        const frequencyCell = document.getElementById(lastKey + '-frequency');
                        frequencyCell.innerText = activeSubject.scoring_data[lastKey].frequency;

                        // Update the Durations
                        // Calculate current duration
                        const duration = lastScoredTime - scoredTime;
                        activeSubject.scoring_data[lastKey].durations.push(duration);

                        // Update the last scored duration
                        const durationCell = document.getElementById(lastKey + '-duration');
                        durationCell.innerText = duration;

                        // Calculate and Update the mean duration for this behaviour
                        const meanDurationCell = document.getElementById(lastKey + '-mean-duration');
                        const meanDuration = arrAvg(activeSubject.scoring_data[lastKey].durations);
                        meanDurationCell.innerText = meanDuration;


                        // Calculate and Update the standard deviation
                        const sdCell = document.getElementById(lastKey + '-sd');
                        const sdValue = arrSTD(activeSubject.scoring_data[lastKey].durations);
                        activeSubject.scoring_data[lastKey].sd = sdValue;
                        sdCell.innerText = sdValue;
                    }
                    // Now set the last scored behaviour
                    lastScoredBehaviour = behaviourParameter;
                    lastScoredTime = scoredTime;
                }
            }

            // Add to the handler "multiplexer"
            keydownHandlers[key.toUpperCase()] = keydownHandler;
        }
    }

    // Register all the beavhiour parameters
    behaviourParameters.forEach(registerBehaviourParameter);

    /** This function is the keydownMultiplexor */
    function keydownMultiplexor(e) {
        // Strips away the "key" and "digit" from the key code
        let keydown = e.code;
        keydown = keydown.substring(keydown.length - 1); // i.e. keep the last character of the code
        // ^ it should also always be uppercase
        // Call the specific keydownHandler;

        // Only call if the key is actually in the keydownHandlers
        if (keydownHandlers.hasOwnProperty(keydown)) {
            keydownHandlers[keydown]();
        }
    }
    // register the multiplexed keydown handler function
    document.addEventListener(
        'keypress',
        keydownMultiplexor
    );
}

// For populating the Active Subject Table
function populateActiveSubject(subject) {
    // Set the active subject.
    // This is necessary because the populateSubjectSearch function
    // Searches a COPY of the current_experiment.subjects_data
    // Thus disconnecting the reference chain.
    for (let i in current_experiment.subjects_data) {
        let temp = current_experiment.subjects_data[i];
        let temp_id = temp.subject_id;

        if (subject.subject_id === temp_id) {
            activeSubject = temp;
        }
    }
    // Get reference to the active subject table body
    const activeSubjectTableBody = document.getElementById('active-subject-table-body');
    // Clear active subject table body
    activeSubjectTableBody.innerHTML = '';
    // Create Table Row for the subject
    const tableRow = createSubjectRow(subject);
    // Add it to the active subject table body
    activeSubjectTableBody.innerHTML = tableRow.outerHTML;

    // If scoring data exists, populate it.

}

function populateSubjectSearch() {
    // For finding the active subject
    $('.ui.search')
        .search({
            source: current_experiment.subjects_data,
            fields: { title: 'subject_id' },
            searchFields: [
                'subject_id'
            ],
            //   fullTextSearch: false
            onSelect: populateActiveSubject
        });
}

