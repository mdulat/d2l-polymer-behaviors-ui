import '@polymer/polymer/polymer-legacy.js';
import './d2l-dom.js';
import 'fastdom/fastdom.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-visible-on-ancestor-styles">
	<template>
		<style>
			:host([d2l-visible-on-ancestor-init]) {
				visibility: hidden;
			}
			:host([d2l-visible-on-ancestor-transition]) {
				transition: transform 200ms ease-out, opacity 200ms ease-out !important;
			}
			:host([d2l-visible-on-ancestor-hide]) {
				opacity: 0 !important;
				transform: translateY(-10px) !important;
			}
			@media only screen and (hover: none), only screen and (-moz-touch-enabled: 1) {
				:host([d2l-visible-on-ancestor-hide]) {
					opacity: 1 !important;
					transform: translateY(0px) !important;
				}
				:host([d2l-visible-on-ancestor-hide][d2l-visible-on-ancestor-no-hover-hide]) {
					opacity: 0 !important;
					transform: translateY(-10px) !important;
				}
			}
		</style>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

window.D2L = window.D2L || {};
window.D2L.PolymerBehaviors = window.D2L.PolymerBehaviors || {};

/** @polymerBehavior */
D2L.PolymerBehaviors.VisibleOnAncestorBehavior = {

	properties: {

		/**
		 * Whether the element is only visible when hovered or focus is within ancestor with 'd2l-visible-on-ancestor-target'.
		 */
		visibleOnAncestor: {
			type: Boolean,
			observer: '__voaHandleVisibleOnAncestor',
			reflectToAttribute: true
		}

	},

	attached: function() {
		this.__voaAttached = true;
		if (this.visibleOnAncestor) {
			// this class prevents possible FOUC in slow clients
			this.setAttribute('d2l-visible-on-ancestor-init', 'd2l-visible-on-ancestor-init');
			this.__voaInit();
		} else if (this.hasAttribute('d2l-visible-on-ancestor-hide')) {
			fastdom.mutate(function() {
				this.removeAttribute('d2l-visible-on-ancestor-hide');
			}.bind(this));
		}
	},

	detached: function() {
		this.__voaAttached = false;
		this.__voaUninit();
	},

	__voaHandleBlur: function(e) {
		if (D2L.Dom.isComposedAncestor(this.__voaTarget, e.relatedTarget)) {
			return;
		}
		this.__voaFocusIn = false;
		this.__voaHide();
	},

	__voaHandleFocus: function() {
		this.__voaFocusIn = true;
		this.__voaShow();
	},

	__voaHandleHideEnd: function(e) {
		if (e.propertyName !== 'transform') {
			return;
		}
		this.removeEventListener('transitionend', this.__voaHandleHideEnd);
		fastdom.mutate(function() {
			this.removeAttribute('d2l-visible-on-ancestor-transition');
		}.bind(this));
	},

	__voaHandleMouseEnter: function() {
		this.__voaMouseOver = true;
		this.__voaShow();
	},

	__voaHandleMouseLeave: function() {
		this.__voaMouseOver = false;
		this.__voaHide();
	},

	__voaHandleShowEnd: function(e) {
		if (e.propertyName !== 'transform') {
			return;
		}
		this.removeEventListener('transitionend', this.__voaHandleShowEnd);
		fastdom.mutate(function() {
			this.removeAttribute('d2l-visible-on-ancestor-transition');
		}.bind(this));
	},

	__voaHandleVisibleOnAncestor: function(newValue, oldValue) {
		if (!this.__voaAttached) return;
		if (oldValue === undefined && newValue) {
			// this class prevents possible FOUC in slow clients
			this.setAttribute('d2l-visible-on-ancestor-init', 'd2l-visible-on-ancestor-init');
		}
		if (newValue) {
			this.__voaInit();
		} else if (oldValue) {
			this.__voaUninit();
		}
	},

	__voaHide: function() {
		if (this.__voaFocusIn || this.__voaMouseOver) return;
		fastdom.mutate(function() {
			this.addEventListener('transitionend', this.__voaHandleHideEnd);
			this.setAttribute('d2l-visible-on-ancestor-transition', 'd2l-visible-on-ancestor-transition');
			this.setAttribute('d2l-visible-on-ancestor-hide', 'd2l-visible-on-ancestor-hide');
		}.bind(this));
	},

	__voaInit: function() {

		requestAnimationFrame(function() {

			if (!this.visibleOnAncestor) {
				this.removeAttribute('d2l-visible-on-ancestor-init');
				return;
			}

			this.__voaTarget = D2L.Dom.findComposedAncestor(this, function(node) {
				if (!node || node.nodeType !== 1) return false;
				return (node.classList.contains('d2l-visible-on-ancestor-target'));
			});
			if (!this.__voaTarget) {
				this.removeAttribute('d2l-visible-on-ancestor-init');
				return;
			}

			this.__voaHandleBlur = this.__voaHandleBlur.bind(this);
			this.__voaHandleFocus = this.__voaHandleFocus.bind(this);
			this.__voaHandleMouseEnter = this.__voaHandleMouseEnter.bind(this);
			this.__voaHandleMouseLeave = this.__voaHandleMouseLeave.bind(this);
			this.__voaHandleHideEnd = this.__voaHandleHideEnd.bind(this);
			this.__voaHandleShowEnd = this.__voaHandleShowEnd.bind(this);

			this.__voaTarget.addEventListener('focus', this.__voaHandleFocus, true);
			this.__voaTarget.addEventListener('blur', this.__voaHandleBlur, true);
			this.__voaTarget.addEventListener('mouseenter', this.__voaHandleMouseEnter);
			this.__voaTarget.addEventListener('mouseleave', this.__voaHandleMouseLeave);

			fastdom.mutate(function() {
				this.removeAttribute('d2l-visible-on-ancestor-init');
				this.setAttribute('d2l-visible-on-ancestor-hide', 'd2l-visible-on-ancestor-hide');
			}.bind(this));

		}.bind(this));

	},

	__voaShow: function() {
		fastdom.mutate(function() {
			this.addEventListener('transitionend', this.__voaHandleShowEnd);
			this.setAttribute('d2l-visible-on-ancestor-transition', 'd2l-visible-on-ancestor-transition');
			this.removeAttribute('d2l-visible-on-ancestor-hide');
		}.bind(this));
	},

	__voaUninit: function() {
		if (!this.__voaTarget) return;
		this.__voaTarget.removeEventListener('focus', this.__voaHandleFocus, true);
		this.__voaTarget.removeEventListener('blur', this.__voaHandleBlur, true);
		this.__voaTarget.removeEventListener('mouseenter', this.__voaHandleMouseEnter);
		this.__voaTarget.removeEventListener('mouseleave', this.__voaHandleMouseLeave);
		this.__voaTarget = null;
	}

};
