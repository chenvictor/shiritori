const Loading = new function() {
    const modal = $('#loadingModal');
    this.show = function() {
        modal.modal('show');
    };
    this.hide = function() {
        modal.modal('hide');
    };
};