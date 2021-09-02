// register a component with aframe; can then be used as tag
AFRAME.registerComponent('marker-click-handler-duck', {

    // init function is called when the component is created
    init: function () {
        const marker = document.querySelector("#marker-duck");
        const aEntity = document.querySelector("#duck-instance");

        console.log(marker)
        console.log(aEntity)

        console.log("initializing duck marker click handler!")

        marker.addEventListener('click', function (ev, target) {
          

            const intersectedElement = ev && ev.detail && ev.detail.intersectedEl;
            console.log(intersectedElement)
            if (aEntity && intersectedElement === aEntity) {

                // this scaling is just a random effect to test interactivity

                const scale = aEntity.getAttribute('scale');
                Object.keys(scale).forEach((key) => scale[key] = scale[key] + 1);
                aEntity.setAttribute('scale', scale);
            }
        });
    }
});

AFRAME.registerComponent('marker-click-handler-splash', {

    // init function is called when the component is created
    init: function () {
        const marker = document.querySelector("#marker-splash");
        const aEntity = document.querySelector("#fauset-instance");

        console.log(marker)
        console.log(aEntity)

        console.log("initializing SPALSH/FAUSET marker click handler!")

        marker.addEventListener('click', function (ev, target) {
          

            const intersectedElement = ev && ev.detail && ev.detail.intersectedEl;
            console.log(intersectedElement)
            if (aEntity && intersectedElement === aEntity) {

                // this scaling is just a random effect to test interactivity

                const scale = aEntity.getAttribute('scale');
                Object.keys(scale).forEach((key) => scale[key] = scale[key] + 1);
                aEntity.setAttribute('scale', scale);
            }
        });
    }
});
