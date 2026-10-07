// Shared Alpine components (loaded before Alpine, registered on alpine:init).
// All visible text lives in the HTML, so both language pages share this file.
document.addEventListener('alpine:init', () => {
  const fmt = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // An audio track. Only one plays at a time: starting one pauses the rest.
  Alpine.data('track', () => ({
    playing: false,
    progress: 0,
    time: '0:00',
    toggle() {
      const a = this.$refs.audio;
      if (a.paused) {
        window.dispatchEvent(new CustomEvent('solo', { detail: a }));
        a.play();
      } else {
        a.pause();
      }
    },
    seek(e) {
      const a = this.$refs.audio;
      if (a.duration) a.currentTime = (e.target.value / 1000) * a.duration;
    },
    init() {
      const a = this.$refs.audio;
      a.controls = false; // native controls are only the no-JS fallback
      a.addEventListener('play', () => (this.playing = true));
      a.addEventListener('pause', () => (this.playing = false));
      a.addEventListener('ended', () => { this.playing = false; this.progress = 0; });
      a.addEventListener('timeupdate', () => {
        this.progress = a.duration ? a.currentTime / a.duration : 0;
        this.time = fmt(a.currentTime);
      });
      window.addEventListener('solo', (e) => { if (e.detail !== a) a.pause(); });
    },
  }));

  // The library's three doors; #watch / #listen / #read open one directly.
  Alpine.data('library', () => ({
    door: null,
    doors: ['watch', 'listen', 'read'],
    toggle(d) {
      this.door = this.door === d ? null : d;
      if (this.door) history.replaceState(null, '', '#' + d);
    },
    fromHash(smooth) {
      const h = location.hash.slice(1);
      if (!this.doors.includes(h)) return;
      this.door = h;
      this.$nextTick(() => this.$refs[h].scrollIntoView({ behavior: smooth && !calm() ? 'smooth' : 'instant' }));
    },
    init() {
      // On first load, wait until layout (fonts, images) has settled before jumping
      if (document.readyState === 'complete') this.fromHash(false);
      else window.addEventListener('load', () => this.fromHash(false), { once: true });
      window.addEventListener('hashchange', () => this.fromHash(true));
    },
  }));

  // Video lightbox: a native <dialog>; the iframe only exists while it's open.
  Alpine.data('lightbox', () => ({
    src: '',
    open(id) {
      this.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      this.$root.showModal();
    },
  }));
});
