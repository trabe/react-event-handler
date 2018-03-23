import React from "react";
import { shallow } from "enzyme";
import EventHandler from "../src/event-handler";

const buildHandlerName = eventName => "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);

const testEvent = (eventName, delay) =>
  done => {
    const start = Date.now();

    const handler = () => {
      try {
        expect(Date.now() - start).toBeGreaterThanOrEqual(delay || 0);
        done();
      } catch (err) {
        console.log("SHIAT", err);
        done.fail();
      }
    };

    const wrapper = shallow(
      <EventHandler {...{ [buildHandlerName(eventName)]: delay ? { handler, delay } : handler }}>
        <div>hey!</div>
      </EventHandler>,
    );

    wrapper.find("span").simulate(eventName);
  };

describe("Snapshots", () => {
  describe("EventHandler", () => {
    it("should render its child", () => {
      const wrapper = shallow(
        <EventHandler>
          <div>this should be seen</div>
        </EventHandler>,
      );
      expect(wrapper).toMatchSnapshot();
    });

    it("should use a custom wrapper", () => {
      const wrapper = shallow(
        <EventHandler wrapper="div">
          <div>this should be seen</div>
        </EventHandler>,
      );
      expect(wrapper).toMatchSnapshot();
    });

    ["click", "mouseEnter", "mouseLeave", "focus", "blur"].forEach(eventName => {
      it(`should invoke ${buildHandlerName(eventName)} on child's ${eventName}`, testEvent(eventName));
      it(`should invoke ${buildHandlerName(eventName)} on child's ${eventName} after 50ms`, testEvent(eventName, 50));
    });
  });
});
