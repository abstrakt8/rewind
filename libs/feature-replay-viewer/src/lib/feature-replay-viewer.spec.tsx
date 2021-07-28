import { render } from "@testing-library/react";

import FeatureReplayViewer from "./feature-replay-viewer";

describe("FeatureReplayViewer", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<FeatureReplayViewer />);
    expect(baseElement).toBeTruthy();
  });
});
