#Author-Autodesk Inc.
#Description-Delete empty components from an assembly.

import adsk, adsk.core, adsk.fusion, traceback

def main():
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        
        # Get all components in the active design.
        product = app.activeProduct
        design = product
        title = 'Delete Empty Components'
        if not design:
            ui.messageBox('No active Fusion design', title)
            return

        components = design.allComponents

        # Find all of the empty components.
        # It is empty if it has no occurrences, bodies, featres, sketches, or construction.
        root = design.rootComponent
        componentsToDelete = []

        for component in components:

            # Skip the root component.
            if root == component:
                continue

            if len(component.occurrences) == 0 \
                and len(component.bRepBodies) == 0 \
                and len(component.features) == 0 \
                and len(component.sketches) == 0 \
                and len(component.constructionPlanes) == 0 \
                and len(component.constructionAxes) == 0 \
                and len(component.constructionPoints) == 0:

                componentsToDelete.append(component)

        # Delete all immediate occurrences of the empty components.
        deletedComponents = []
        global k
        k = 0
        for component in componentsToDelete:

            # Get the name first because deleting the final Occurrence will delete the Component.
            name = component.name

            # Build a list of unique immediate occurrences of the component.
            occurrences = root.allOccurrencesByComponent(component)
            uniqueOccurrences = []
            for occurrence in occurrences:
                
                for k in range(0, len(uniqueOccurrences)):
                    if occurrence is uniqueOccurrences[k]:
                        break
                if k == len(uniqueOccurrences):
                    uniqueOccurrences.append(occurrence)

            # Delete them.
            for uniqueOccurrencesI in uniqueOccurrences:
                uniqueOccurrencesI.deleteMe()

            deletedComponents.append(name)

        if len(deletedComponents) == 0:
            msg = 'No empty components found.'
        else:
            if len(deletedComponents) > 1:
                msg = str(len(deletedComponents)) + ' empty component' + 's'
            else:
                msg = str(len(deletedComponents)) + ' empty component' + ' deleted'
            msg += '\n\n'
            for deletedComponentI in deletedComponents:
                msg += '\n' + deletedComponentI

        ui.messageBox(msg, title)

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))

main()
