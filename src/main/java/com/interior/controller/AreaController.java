package com.interior.controller;

import com.interior.model.Area;
import com.interior.repository.AreaRepository;
import com.interior.repository.ProjectRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/areas")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class AreaController {
  private final AreaRepository repo;
  private final ProjectRepository projectRepo;

  public AreaController(AreaRepository repo, ProjectRepository projectRepo) {
    this.repo = repo;
    this.projectRepo = projectRepo;
  }

  @GetMapping public List<Area> list(@RequestParam Long projectId) { return repo.findByProject_Id(projectId); }
  @GetMapping("/{id}") public Area get(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }

  @PostMapping
  public Area create(@Valid @RequestBody Area a, @RequestParam Long projectId) {
    a.setId(null);
    a.setProject(projectRepo.findById(projectId).orElseThrow());
    return repo.save(a);
  }

  @PutMapping("/{id}")
  public Area update(@PathVariable Long id, @Valid @RequestBody Area a) {
    Area db = repo.findById(id).orElseThrow();
    db.setName(a.getName());
    db.setType(a.getType());
    db.setNotes(a.getNotes());
    db.setLength(a.getLength());
    db.setWidth(a.getWidth());
    db.setHeight(a.getHeight());
    return repo.save(db);
  }

  @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
