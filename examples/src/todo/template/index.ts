import { html } from '../../utils';

export const template = () => html`
  <div id="todo-root">
    <style>
      #todo-root {
        max-width: 600px;
        padding: 0px 20px;
        margin: 20px auto;
      }

      #list li.is-completed .todo-text {
        opacity: 0.7;
        text-decoration: line-through;
      }

      #list li {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        line-height: 1.5;
      }

      #list li > .todo-text {
        flex: 0 0 auto;
        margin-right: auto;
      }

      button[data-action] {
        display: inline-block;
        margin: 0 4px;
        padding: 8px 4px;
        background: none;
        border: 0;
        border-radius: 0;
        flex: 0 0 auto;
        cursor: pointer;
      }
    </style>
    <div>
      <form action="" id="form" autocomplete="off">
        <label for="todo-input" class="sr-only">Email address</label>
        <input
          class="form-control"
          type="text"
          id="todo-input"
          name="todo"
          placeholder="todo text..."
        />
      </form>
    </div>

    <p id="count" class="my-2"></p>

    <ul id="list" class="list-group"></ul>
    <template id="todo-item-tmpl">
      <span class="todo-text"></span>
      <div class="btn-group" role="group">
        <button
          type="button"
          data-action="complete"
          aria-label="Toggle completed"
        >
          <i class="fas fa-check"></i>
        </button>
        <button type="button" data-action="remove" aria-label="Delete">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </template>
  </div>
`;
