///Small example for testing hit-test, dom-overlay and raycast to virtual objects with WebXR in combination with A-Frame

//boolean for enabling/disabling hittest/raycast when switching the toggle-button
let hittest_enabled = true;

AFRAME.registerComponent('raycast', {
  schema: {
        element: { default: '' },
    },
  dependencies: ['raycaster'],
  init: function () {
    let component = this;
    this.raycaster = this.el.getAttribute('raycaster');
    this.targetElement = this.data.element && document.querySelector(this.data.element);

    this.el.sceneEl.renderer.xr.addEventListener('sessionstart', function sessionStartColliderCheck(ev) {
      
      component.targetElement.addEventListener('touchstart', (ev) => {
        if(hittest_enabled) return;
        component.raycaster.enabled = true;

        component.camera = component.el.sceneEl.camera;
        component.camera.parent.updateMatrixWorld();
        const screenPosition = {x: ev.touches[0].screenX, y: ev.touches[0].screenY};

        const origin = new THREE.Vector3();
        const direction = new THREE.Vector3();
        const raycasterConfig = {origin: origin, direction: direction};
        
        origin.setFromMatrixPosition(component.camera.matrixWorld);

        const normalizedScreenPosition = {x: screenPosition.x/document.body.clientWidth * 2 -1, y: -(screenPosition.y/document.body.clientHeight) * 2 + 1};

        const matrix = new THREE.Matrix4();
        const matrixInverse = matrix.copy(component.camera.projectionMatrix).invert();
        direction.set(normalizedScreenPosition.x, normalizedScreenPosition.y, 0.5).applyMatrix4(matrixInverse).applyMatrix4(component.camera.matrixWorld).sub(origin).normalize();

        component.el.setAttribute("raycaster", raycasterConfig);
      });
      
      component.targetElement.addEventListener('touchend', (ev) => {
        if(hittest_enabled) return;
        //change direction of raycaster so it will reset, fire the cleared-events and the same object can be "selected" again
        component.el.setAttribute("raycaster", 'direction: 0 0 -1');
      });
    });
    component.el.addEventListener('raycaster-intersection', function (evt) {
      console.log('An element was clicked');
    });
  }
});


AFRAME.registerComponent('raycast-listener', {
  init: function () {
    var lastIndex = -1;
    var COLORS = ['yellow', 'green', 'blue'];
    this.el.addEventListener('raycaster-intersected', function (evt) {
      lastIndex = (lastIndex + 1) % COLORS.length;
      this.setAttribute('material', 'color', COLORS[lastIndex]);
    });
  }
});


AFRAME.registerComponent("raycast-toggle", {
  schema: {
    element: { type: "selector" }
  },
  init: function() {
    let component = this;
    this.raycasterElement = document.querySelector('#raycasterElement');
    this.data.element.addEventListener("click", ev => {

      if (this.data.element.checked) {
        hittest_enabled = true;
      } else {
        hittest_enabled = false;
      }
    });
    //prevents select-events on the session when clicking the button
    document.getElementById("switch").addEventListener("beforexrselect", function preventUIxrSelectListener(ev) {
        ev.preventDefault();
      });
  }
});

AFRAME.registerComponent("ar-hit-test", {
  init: function() {
    let component = this;
    this.xrHitTestSource = null;
    this.viewerSpace = null;
    this.refSpace = null;

    this.el.sceneEl.renderer.xr.addEventListener("sessionend", ev => {
      this.viewerSpace = null;
      this.refSpace = null;
      this.xrHitTestSource = null;
    });
    this.el.sceneEl.renderer.xr.addEventListener("sessionstart", ev => {
      let session = this.el.sceneEl.renderer.xr.getSession();

      let element = this.el;
      session.addEventListener("select", function() {
        if (!hittest_enabled) return;

        let position = element.getAttribute("position");

        //create a box at the position of the reticle
        const box = document.createElement("a-box");
        box.setAttribute("color", "red");
        box.setAttribute("depth", 0.1);
        box.setAttribute("height", 0.1);
        box.setAttribute("width", 0.1);
        box.setAttribute("position", position);
        box.classList.add("collidable");
        box.setAttribute("raycast-listener", "");
        element.sceneEl.appendChild(box);
      });

      session.requestReferenceSpace("viewer").then(space => {
        this.viewerSpace = space;
        session
          .requestHitTestSource({ space: this.viewerSpace })
          .then(hitTestSource => {
            this.xrHitTestSource = hitTestSource;
          });
      });

      session.requestReferenceSpace("local-floor").then(space => {
        this.refSpace = space;
      });
    });
  },
  tick: function() {
    //disable the hittest if the toggle-button is switched off
    if (!hittest_enabled) {
      this.el.setAttribute("visible", false);
      return;
    } else {
      this.el.setAttribute("visible", true);
    }

    if (this.el.sceneEl.is("ar-mode")) {
      if (!this.viewerSpace) return;

      let frame = this.el.sceneEl.frame;
      let xrViewerPose = frame.getViewerPose(this.refSpace);
      
      //hide the reticle if the hittest is not available
      this.el.setAttribute("visible", false);

      if (this.xrHitTestSource && xrViewerPose) {
        let hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
        if (hitTestResults.length > 0) {
          this.el.setAttribute("visible", true);
          
          let pose = hitTestResults[0].getPose(this.refSpace);

          let inputMat = new THREE.Matrix4();
          inputMat.fromArray(pose.transform.matrix);

          let position = new THREE.Vector3();
          position.setFromMatrixPosition(inputMat);
          this.el.setAttribute("position", position);
        }
      }
    }
  }
});
