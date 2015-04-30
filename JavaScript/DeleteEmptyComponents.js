//Author-Autodesk Inc.
//Description-Delete empty components from an assembly.
/*globals adsk*/
(function () {

    'use strict';

    if (adsk.debug === true) {
        /*jslint debug: true*/
        debugger;
        /*jslint debug: false*/
    }
    
    var ui;
    try {
        
        var app = adsk.core.Application.get();
        ui = app.userInterface;
        
        // Get all components in the active design.
        var product = app.activeProduct;
        var design = adsk.fusion.Design(product);
        var title = 'Delete Empty Components';
        if (!design) {
            ui.messageBox('No active Fusion design', title);
            adsk.terminate();
            return;
        }
        var components = design.allComponents;

        // Find all of the empty components.
        // It is empty if it has no occurrences, bodies, featres, sketches, or construction.
        var root = design.rootComponent;
        var nComponents = components.count;
        var componentsToDelete = [];
        var i, component;
        for (i = 0; i < nComponents; ++i) {
            component = components.item(i);

            // Skip the root component.
            if (root.equals(component)) {
                continue;
            }

            if (component.occurrences.count === 0
                    && component.bRepBodies.count === 0
                    && component.features.count === 0
                    && component.sketches.count === 0
                    && component.constructionPlanes.count === 0
                    && component.constructionAxes.count === 0
                    && component.constructionPoints.count === 0) {
                componentsToDelete.push(component);
            }
        }

        // Delete all immediate occurrences of the empty components.
        var deletedComponents = [], name, occurrences, j, occurrence, uniqueOccurrences, k;
        for (i = 0; i < componentsToDelete.length; ++i) {
            component = componentsToDelete[i];

            // Get the name first because deleting the final Occurrence will delete the Component.
            name = component.name;

            // Build a list of unique immediate occurrences of the component.
            occurrences = root.allOccurrencesByComponent(component);
            uniqueOccurrences = [];
            for (j = 0; j < occurrences.count; ++j) {
                occurrence = occurrences.item(j).nativeObject;
                for (k = 0; k < uniqueOccurrences.length; ++k) {
                    if (occurrence.equals(uniqueOccurrences[k])) {
                        break;
                    }
                }
                if (k === uniqueOccurrences.length) {
                    uniqueOccurrences.push(occurrence);
                }
            }

            // Delete them.
            for (j = 0; j < uniqueOccurrences.length; ++j) {
                uniqueOccurrences[j].deleteMe();
            }
            deletedComponents.push(name);
        }

        var msg;
        if (deletedComponents.length === 0) {
            msg = 'No empty components found.';
        } else {
            msg = deletedComponents.length + ' empty component' + (deletedComponents.length > 1 ? 's' : '') + ' deleted';
            msg += '\n\n';
            for (i = 0; i < deletedComponents.length; ++i) {
                msg += '\n' + deletedComponents[i];
            }
        }
        ui.messageBox(msg, title);

    } 
    catch (e) {
        if (ui) {
            ui.messageBox('Failed : ' + (e.description ? e.description : e));
        }
    }

    adsk.terminate();
}());
