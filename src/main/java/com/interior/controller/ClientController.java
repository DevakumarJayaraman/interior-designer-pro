package com.interior.controller;

import com.interior.model.Client;
import com.interior.repository.ClientRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {
  private final ClientRepository repo;
  public ClientController(ClientRepository repo) { this.repo = repo; }

  @GetMapping public List<Client> list() { return repo.findAll(); }
  @GetMapping("/{id}") public Client get(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }

  @PostMapping public Client create(@Valid @RequestBody Client c) { c.setId(null); return repo.save(c); }

  @PutMapping("/{id}")
  public Client update(@PathVariable Long id, @Valid @RequestBody Client c) {
    Client db = repo.findById(id).orElseThrow();
    db.setName(c.getName());
    db.setPhone(c.getPhone());
    db.setEmail(c.getEmail());
    db.setAddress(c.getAddress());
    return repo.save(db);
  }

  @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
