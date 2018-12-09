const WordForm = new function() {
    const INPUT = document.getElementById("inputWord");
    const FORM = document.getElementById("wordForm");
    const REGEX = '\[\u3040-\u309f\]';

    let enabled = true;

    this.submit = function() {
        INPUT.classList.remove("is-invalid");
        let val = INPUT.value;
        let valid = validate(val);
        if (valid) {
            Client.submitWord(val);
            Interface.hideWordModal();
            FORM.blur();
        } else {
            showError();
        }
    };

    let validate = function(input) {
        return input.length > 1 && input.match(REGEX);
    };

    let showError = function() {
        INPUT.classList.add("is-invalid");
    };
};