package com.example.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { TodoApp() }
    }
}

@Composable
fun TodoApp() {
    var todos by remember { mutableStateOf(listOf<TodoItem>()) }
    var newTodoText by remember { mutableStateOf("") }

    MaterialTheme {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text(
                text = "Todo List",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier
                    .align(alignment = Alignment.CenterHorizontally)
                    .padding(bottom = 24.dp)
            )

            // Input field for new todo
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    value = newTodoText,
                    onValueChange = { newTodoText = it },
                    label = { Text("Add a new todo") },
                    placeholder = { Text("Enter todo item...") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                    singleLine = true,
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 8.dp)
                )
                Button(
                    onClick = {
                        if (newTodoText.isNotBlank()) {
                            todos = todos + TodoItem(text = newTodoText.trim())
                            newTodoText = ""
                        }
                    },
                    enabled = newTodoText.isNotBlank()
                ) {
                    Text("Add")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Todo list
            Text(
                text = "Your Todos (${todos.size})",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.align(alignment = Alignment.Start)
            )

            if (todos.isEmpty()) {
                Text(
                    text = "No todos yet. Add one above!",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier
                        .align(alignment = Alignment.CenterHorizontally)
                        .padding(top = 24.dp)
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(todos, key = { it.id }) { todo ->
                        TodoItemRow(
                            todo = todo,
                            onDelete = { todos = todos.filterNot { it.id == todo.id } },
                            onToggle = {
                                todos = todos.map {
                                    if (it.id == todo.id) it.copy(completed = !it.completed) else it
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

data class TodoItem(
    val id: Long = System.currentTimeMillis(),
    val text: String,
    val completed: Boolean = false
)

@Composable
fun TodoItemRow(
    todo: TodoItem,
    onDelete: () -> Unit,
    onToggle: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = todo.completed,
            onCheckedChange = { onToggle() },
            modifier = Modifier.padding(end = 12.dp)
        )
        Text(
            text = todo.text,
            style = MaterialTheme.typography.bodyLarge.copy(
                textDecoration = if (todo.completed) TextDecoration.LineThrough else TextDecoration.None
            ),
            modifier = Modifier.width(200.dp)
        )
        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = onDelete,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.errorContainer,
                contentColor = MaterialTheme.colorScheme.onErrorContainer
            )
        ) {
            Text("Delete")
        }
    }
}
