require.config({
    baseUrl: "js",
    paths: {
        "jquery": "/lib/jquery/dist/jquery.min",
        "functionDropdown": "functionDropdown",
        "functionEnabled": "functionEnabled",
        "functionFind": "functionFind",
        "functionGrid": "functionGrid",
        "functionMask": "functionMask",
        "functionPhoto": "functionPhoto",
        "functionSubForm": "functionSubForm",
        "functionKitchenDisplay": "functionKitchenDisplay",
        "trumbowyg": "/lib/trumbowyg/dist/trumbowyg",
        "ag-grid": "/lib/ag-grid/ag-grid-community.min"
    },
    shim: {
        "trumbowyg": {
            deps: ["jquery"]
        },
        "functionPhoto": {
            deps: ["jquery"]
        }
    }
});