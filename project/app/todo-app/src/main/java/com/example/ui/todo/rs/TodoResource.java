package com.example.ui.todo.rs;

import com.example.ui.todo.Store;
import com.example.ui.todo.Todo;

import javax.inject.Inject;
import javax.print.attribute.standard.Media;
import javax.ws.rs.*;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import java.util.List;
import java.util.Optional;

@Path("/todos")
@Produces(MediaType.APPLICATION_JSON)
public class TodoResource {

    @Inject
    Store store;

    @GET
    public List<Todo> getAll() {
        return store.getAll();
    }

    @POST
    public Response create(Todo todo) {
        Todo savedTodo = store.save(todo);

        return Response.created(UriBuilder
                        .fromResource(TodoResource.class)
                        .path("{id}").build(savedTodo.getId())
                ).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON)
                .build();
    }

    @PUT
    @Path("{id}")
    public Todo update(@PathParam("id") long id, Todo todo) {
        Optional<Todo> save = store.save(id, todo);
        return save.get();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") long id) {
        store.remove(id);
        return Response.noContent().build();
    }


}
