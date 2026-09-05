// bg-dots disabled: no-op to prevent animations and reduce CPU
(function () {
  if (typeof console !== 'undefined') console.log('bg-dots: disabled (safe mode)');
  // intentionally a no-op to avoid creating canvases or animations
})();
