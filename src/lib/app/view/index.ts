import View from "./View.svelte";
import Box from "./Box.svelte";
import HBox from "./HBox.svelte";
import VBox from "./VBox.svelte";
import Grid from "./Grid.svelte";
import Row from "./Row.svelte";
import Cell from "./Cell.svelte";
import Separator from "./Separator.svelte";
import Label from "./Label.svelte";
import Button from "./Button.svelte";
import Switch from "./Switch.svelte";
import Select from "./Select.svelte";
import Item from "./Item.svelte";
import InputText from "./InputText.svelte";
import InputNumber from "./InputNumber.svelte";
import InputColor from "./InputColor.svelte";
import InputTime from "./InputTime.svelte";
import InputDuration from "./InputDuration.svelte";
import WaveformChart from "./WaveformChart.svelte";
import XYChart from "./XYChart.svelte";

export const Views = {
  // Layout components
  view: View,
  box: Box,
  "h-box": HBox,
  "v-box": VBox,
  grid: Grid,
  row: Row,
  cell: Cell,
  separator: Separator,

  // Display components
  label: Label,

  // Interactive components
  button: Button,
  switch: Switch,
  select: Select,
  item: Item,

  // Input components
  "input-text": InputText,
  "input-number": InputNumber,
  "input-color": InputColor,
  "input-time": InputTime,
  "input-duration": InputDuration,

  // Chart components
  "waveform-chart": WaveformChart,
  "xy-chart": XYChart,
};
