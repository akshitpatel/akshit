var loadingModule = {

    loaded: 0,
    list: [],
    executed: 0,
    loaded: 0,

    init: function() {
        // Security check
        if(this.loaded != 0) {
            return ;
        }
        this.loaded = 1;

        this.listeners();
    },

    listeners: function() {

    },

    // Register module to priority queue
    registerModule: function(module, priority, data) {

        var list = loadingModule.list;
        var obj = {fn: module, priority: priority, data: data};

        for (var i = 0; i < list.length; i++) {
            // if our new priority is greater, then insert it here
            if (priority > list[i].priority) {
                list.splice(i, 0, obj);
                return;
            }
        }

        // if the list was either empty or no priorities in the list were less than
        // the new priority, then just add this onto the end of the list
        list.push(obj);
    },

    // Execute modules in order
    execute: function() {

        // execute in priority order
        var list = this.list, retVal, args;
        for (var i = 0; i < list.length; i++) {
            args = [].slice.call(arguments, 0);
            // add the data for this callback to any arguments that were passed to execute
            args.unshift(list[i].data);
            retVal = list[i].fn.apply(this, args);

            // if callback returns false, then stop further callback execution
            if (retVal === false) {
                return;
            }
        }
    }


}