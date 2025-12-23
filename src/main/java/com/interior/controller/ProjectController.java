package com.interior.controller;

import com.interior.model.Project;
import com.interior.repository.ClientRepository;
import com.interior.repository.ProjectRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
  private final ProjectRepository repo;
  private final ClientRepository clientRepo;

  public ProjectController(ProjectRepository repo, ClientRepository clientRepo) {
    this.repo = repo;
    this.clientRepo = clientRepo;
  }

  @GetMapping public List<Project> list(@RequestParam(required = false) Long clientId) {
    if (clientId != null) return repo.findByClient_Id(clientId);
    return repo.findAll();
  }

  @GetMapping("/{id}") public Project get(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }

  @PostMapping
  public Project create(@Valid @RequestBody Project p, @RequestParam Long clientId) {
    p.setId(null);
    p.setClient(clientRepo.findById(clientId).orElseThrow());
    return repo.save(p);
  }

  @PutMapping("/{id}")
  public Project update(@PathVariable Long id, @Valid @RequestBody Project p) {
    Project db = repo.findById(id).orElseThrow();
    db.setName(p.getName());
    db.setSiteAddress(p.getSiteAddress());
    db.setPropertyType(p.getPropertyType());
    db.setScope(p.getScope());
    db.setTimeline(p.getTimeline());
    db.setNotes(p.getNotes());
    return repo.save(db);
  }

  @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
