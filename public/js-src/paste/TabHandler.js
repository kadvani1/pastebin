dojo.provide("paste.TabHandler");

dojo.require("paste.layer");
dojo.require("dijit.layout.ContentPane");

dojo.declare("paste.TabHandler", null, {
    constructor: function(baseUrl) {
        this.baseUrl     = baseUrl;
        this.pasteTab    = null;
        this.followupTab = null;
    },

    createPasteTabs: function(pasteId, baseUrl) {
        // create tab that remotes to pasteid
        this.pasteTab = new dijit.layout.ContentPane({
                id: "paste",
                parseOnLoad: true,
            },
            dojo.doc.createElement("div")
        );
        dojo.connect(this.pasteTab, "onLoad", paste.formattedShow);
        dojo.connect(this.pasteTab, "onLoad", paste.setStatusFromMetadata);

        // create tab that remotes to followup for pasteid
        this.followupTab = new dijit.layout.ContentPane({
                id: "followup",
                parseOnLoad: true,
            },
            dojo.doc.createElement("div")
        );
        dojo.connect(this.followupTab, "onLoad", paste.prepareFollowupForm);

        // attach tabs to tab container
        this.getPasteContainer().addChild(this.pasteTab);
        this.getPasteContainer().addChild(this.followupTab);
        this.pasteTab.startup();
        this.followupTab.startup();

        // Ensure selectChild continues to work for other tabs
        dojo.connect(this.getPasteContainer(), "selectChild", this, "urlUpdateHandler");
    },

    getFollowupUrl: function(pasteId) {
        return this.baseUrl + "/paste/followup/id/" + pasteId + "/format/ajax";
    },

    getPasteContainer: function() {
        return dijit.byId("pastebin");
    },

    getPasteUrl: function(pasteId) {
        return this.baseUrl + "/paste/display/id/" + pasteId + "/format/ajax";
    },

    loadFollowupTab: function(pasteId) {
        this._loadTabs(pasteId);
        this.getPasteContainer().selectChild(this.followupTab);
        this.urlUpdateHandler(this.followupTab);
    },

    loadPasteTabs: function(pasteId) {
        this._loadTabs(pasteId);
        this.getPasteContainer().selectChild(this.pasteTab);
        this.urlUpdateHandler(this.pasteTab);
    },

    urlChangeHandler: function() {
        if (window.location.hash) {
            var hash = window.location.hash.slice(1);   // strip leading "#"
            if (hash.match(/^(new-paste|about|active)$/i)) {
                var tab = dijit.byId(hash.toLowerCase());
                dijit.byId("pastebin").selectChild(tab);
            } else if (hash.match(/^[a-z0-9]{13}$/i)) {
                this.loadPasteTabs(hash.toLowerCase());
            } else if (hash.match(/^followup-([a-z0-9]{13})$/i)) {
                var followupRegex = new RegExp(/^followup-([a-z0-9]{13})$/);
                var matches       = followupRegex.exec(hash.toLowerCase());
                this.loadFollowupTab(matches[1], false);
            }
        }
    },

    urlUpdateHandler: function(tab) {
        // update the URL hash to the current tab
        var id = tab.attr("id");
        if (id.match(/^(new-paste|about|active)$/i)) {
            dojo.back.addToHistory({
                handle:    dojo.hitch(this, "urlChangeHandler"),
                changeUrl: id,
            });
        } else if ("paste" == id) {
            var pastetab = dijit.byId(id);
            var pasteid  = pastetab.controlButton.attr("label");
            dojo.back.addToHistory({
                handle:    dojo.hitch(this, "urlChangeHandler"),
                changeUrl: pasteid,
            });
        } else if ("followup" == id) {
            var followuptab = dijit.byId(id);
            var label       = followuptab.controlButton.attr("label");
            var labelRegex  = new RegExp(/Followup: ([a-z0-9]{13})/);
            var matches     = labelRegex.exec(label);
            dojo.back.addToHistory({
                handle:    dojo.hitch(this, "urlChangeHandler"),
                changeUrl: "followup-" + matches[1],
            });
        }
    },

    _loadTabs: function(pasteId) {
        if (this.pasteTab == null) {
            this.createPasteTabs(pasteId);
        }

        // Reset paste tab href and title
        this.pasteTab.attr("href", this.getPasteUrl(pasteId));
        this.pasteTab.controlButton.attr("label", pasteId);

        // Reset followup tab href and title
        this.followupTab.attr("href", this.getFollowupUrl(pasteId));
        this.followupTab.controlButton.attr("label", "Followup: " + pasteId);
    },
});
