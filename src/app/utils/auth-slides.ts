/** Slides photo — logistique Verga (connexion / inscription). */
export interface AuthSlide {
  imageUrl: string;
  captionKey: string;
}

export const AUTH_SLIDES: AuthSlide[] = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1400&q=80',
    captionKey: 'auth.slider.captionShip',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
    captionKey: 'auth.slider.captionContainers',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80',
    captionKey: 'auth.slider.captionAir',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=80',
    captionKey: 'auth.slider.captionPort',
  },
];
