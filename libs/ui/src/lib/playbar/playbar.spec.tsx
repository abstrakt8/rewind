import { render } from '@testing-library/react';

import Playbar from './playbar';

describe('Playbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Playbar />);
    expect(baseElement).toBeTruthy();
  });
});
