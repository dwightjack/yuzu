import { html } from '../../utils';

export const template = (): unknown => html`
  <div id="app-connect">
    <p id="num" class="badge badge-secondary"></p>
    <div id="list">
      <button class="button btn btn-primary" type="button">Add</button>
      <ul class="list-group mt-2"></ul>
    </div>
  </div>
`;
