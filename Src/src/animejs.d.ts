declare module 'animejs/lib/anime.es.js' {
  import anime from 'animejs';
  export default anime;
}

declare module 'animejs' {
  interface AnimeInstance {
    play: () => void;
    pause: () => void;
    restart: () => void;
    seek: (time: number) => void;
    finished: Promise<void>;
  }

  interface AnimeTimelineInstance extends AnimeInstance {
    add: (params: any, offset?: string | number) => AnimeTimelineInstance;
  }

  interface AnimeStatic {
    (params: any): AnimeInstance;
    timeline: (params?: any) => AnimeTimelineInstance;
    stagger: (value: any, options?: any) => any;
    set: (targets: any, params: any) => void;
    remove: (targets: any) => void;
    running: AnimeInstance[];
    version: string;
  }

  const anime: AnimeStatic;
  export default anime;
}
