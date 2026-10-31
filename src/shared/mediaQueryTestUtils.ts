export const mockSmallScreen = () => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
};

export const restoreScreenSize = () => {
  // jsdom doesn't implement matchMedia, so there's no original to put back.
  delete (window as Partial<Window>).matchMedia;
};
