# react-event-handler

## Description

react-event-handler is a component that allows you to handle the events of children elements, delay the invocation of
the handlers, and manage some extra events like "clickAnywhere".

## Installation

```
npm install --save react-event-handler
```

## Usage
```
import EventHandler from "react-event-handler";

const MyButton () =>
  <EventHandler
    onClick={() => console.log("click!")>
    onMouseEnter={handler: () => console.log("mouse enter!"), delay: 1000}
  >
    <div>click here</div>
  </EventHandler>
```


## API

Props can either be simple handler function or an object with the properties `handler` and `delay`.

| Prop            | Type            | Optional |
|:----------------|:----------------|:---------|
| onClick         | function|object |    yes   |
| onMouseEnter    | function|object |    yes   |
| onMouseLeave    | function|object |    yes   |
| onFocus         | function|object |    yes   |
| onBlur          | function|object |    yes   |
| onClickAnywhere | function|object |    yes   |

## CHANGELOG

### v0.1.0

* Initial release
